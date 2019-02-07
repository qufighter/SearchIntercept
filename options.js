// shared functions (help page and other)

function toggleNextSiblingVisiblity(ev){
    var slf = ev.target;
    var sib = slf.nextSibling;
    if( sib.style.display == 'block' ){
        sib.style.display = 'none';
        if( slf.getAttribute('showText') ) slf.innerText=slf.getAttribute('showText');
    }else{
        sib.style.display = 'block';
        if( slf.getAttribute('hideText') ) slf.innerText=slf.getAttribute('hideText');
        sib.scrollIntoViewIfNeeded();
    }
    if(ev.preventDefault)ev.preventDefault();
}

var rememberLastLocation = true;
var noAutoSearchPattern = '';
var alwaysAutoGoPattern = '';
var searchEngines=[
    {name:'Google', url: 'https://www.google.com/search?q=%s'},
    {name:'Bing', url: 'https://www.bing.com/search?q=%s'},
    {name:'DuckDuckGo', url: 'https://duckduckgo.com/?q=%s'},
    {name:'Yahoo', url: 'https://search.yahoo.com/search?p=%s'},
    {name:'Ask', url: 'http://www.ask.com/web?q=%s'},
    {name:'Amazon', url: 'http://amazon.com/s?tag=a2d5nfn4elbes-20&field-keywords=%s'}
];

if( localStorage.searchEngines && localStorage.searchEngines.length ){
    try{
        var newEng = JSON.parse(localStorage.searchEngines);
        if( newEng.length ){
            searchEngines = newEng;
        }
    }catch(e){
        console.log('json parse error searchEngines');
    }
}

if( localStorage.noAutoSearchPattern ){
    noAutoSearchPattern = localStorage.noAutoSearchPattern;
}

if( localStorage.alwaysAutoGoPattern ){
    alwaysAutoGoPattern = localStorage.alwaysAutoGoPattern;
}

if( localStorage.rememberLastLocation == 'false' ){
    rememberLastLocation = false;
}

function loadSearchEngineSelect(){
    Cr.empty(document.getElementById('selectContainer'));
    var selEng = Cr.elm('select',{id:'selectedEngine'},searchEngineOptions(),document.getElementById('selectContainer'));
    if(localStorage.lastLoc) selEng.value = localStorage.lastLoc;
}

function searchEngineOptions(){
    var seo = [];
    var lastLocValid = false;
    for( var e=0,el=searchEngines.length; e<el; e++ ){
        seo.push(Cr.elm('option',{value:searchEngines[e].url},[Cr.txt(searchEngines[e].name)]));
        if(localStorage.lastLoc == searchEngines[e].url){
            lastLocValid = true;
        }
    }
    if( !lastLocValid ){
        delete localStorage.lastLoc;
    }
    return seo;
}

function applyPlaceholder(e){
    if( e.target.value==='' ){
        console.log('attrPlaceholder', e.target.getAttribute('placeholder') );
    }
}

function resetSearchEngines(ev){
    ev.preventDefault();
    if( confirm("Warning - this will delete all search engines above and reset to factory default ~5 search engines.\n\nAre you sure?") ){
        localStorage.searchEngines = null;
        window.location.reload();
    }
}

function saveSearchEngines(){
    var engElm = document.getElementById('savedEngines');
    var newEngines = [], n, u;
    for(var i=0,l=engElm.childNodes.length; i<l; i++ ){
        n = engElm.childNodes[i].querySelector('.enginename').value;
        u = engElm.childNodes[i].querySelector('.engineurl').value;
        if( n && u ) newEngines.push({'name': n, 'url': u});
    }
    if( newEngines.length ) searchEngines = newEngines;
    noAutoSearchPattern =  document.getElementById('noAutoSearchPattern').value;
    alwaysAutoGoPattern =  document.getElementById('alwaysAutoGoPattern').value;
    rememberLastLocation = document.getElementById('rememberLastLocation').checked;
    localStorage.searchEngines = JSON.stringify(searchEngines);
    localStorage.noAutoSearchPattern = noAutoSearchPattern;
    localStorage.alwaysAutoGoPattern = alwaysAutoGoPattern;
    localStorage.lastLoc = document.getElementById('selectedEngine').value;
    localStorage.rememberLastLocation = rememberLastLocation ? 'true' : 'false';
    loadSearchEngineSelect();
    toggleNextSiblingVisiblity({target:engElm.parentNode.previousSibling});
}

function createEditRow(engine, dest){
    Cr.elm('div',{class:''},[
        Cr.elm('input', {value:engine.name,placeholder:'Name', class: 'enginename'}),
        Cr.elm('input', {value:engine.url, placeholder:'Search URL Pattern', class: 'engineurl'})
    ], dest);
}

function editSearchEngineOptions(ev){
    toggleNextSiblingVisiblity(ev);
    document.getElementById('content').style.top='15%';
    var engElm = document.getElementById('savedEngines');
    Cr.empty(engElm);
    for( var e=0,el=searchEngines.length; e<el; e++ ){
        createEditRow(searchEngines[e], engElm);
    }
    document.getElementById('noAutoSearchPattern').value = noAutoSearchPattern;
    document.getElementById('alwaysAutoGoPattern').value = alwaysAutoGoPattern;
    document.getElementById('rememberLastLocation').checked = rememberLastLocation;
}

function treatEntryAsLoc(ev){
    ev.preventDefault();
    dest = document.getElementById('q').value.replace(/\s/g,'');
    if( dest.indexOf('://') < 1 ){
        dest="http://"+dest;
    }
    if( confirm('window.location = "'+dest+'" ?'+"\n\nThis will attempt to navigate to the URL shown above.") ){
        window.location=dest;
    }
}

document.addEventListener('DOMContentLoaded', function () {


    var h = window.location.href;
    var s = h.indexOf('q=');
    if( s > -1 ){
        var s = decodeURIComponent(h.substr(s+2).replace(/\+/g,' '));
        console.log(s, alwaysAutoGoPattern, s.match(alwaysAutoGoPattern));
        var goPattern = s.match(alwaysAutoGoPattern);
        if( goPattern && goPattern[0] ){
            if( s.match(/^http/) ){
                window.location = s;
            }else{
                window.location = 'http://'+s; // if we got somethign we just go!
            }
            return;
        }else{
            document.getElementById('q').value=s+' ';
            if( !noAutoSearchPattern || !s.match(new RegExp(noAutoSearchPattern, 'gi')) ){
                document.getElementById('q').focus();
                document.getElementById('q').select();
            }
        }
    }

    loadSearchEngineSelect();

    document.getElementById('searchForm').addEventListener('submit',function(ev){
        if( rememberLastLocation ) localStorage.lastLoc = document.getElementById('selectedEngine').value;
        window.location = document.getElementById('selectedEngine').value.replace('%s', encodeURIComponent(document.getElementById('q').value.replace(/\s+$/, '')).replace(/%20/g, '+'));
        ev.preventDefault();
    });
    document.getElementById('treatAsLocation').addEventListener('click',treatEntryAsLoc);

    document.getElementById('editTrigger').addEventListener('click',editSearchEngineOptions);
    document.getElementById('saveEngines').addEventListener('click',saveSearchEngines);
    document.getElementById('addEngine').addEventListener('click',function(){createEditRow({name:'',url:''}, document.getElementById('savedEngines'))});
    document.getElementById('reset').addEventListener('click',resetSearchEngines);

    //help page stuff

    var as=document.getElementsByClassName('autoselect');
    for( var asi=0,asl=as.length;asi<asl;asi++ ){
        (function(elm, origv){
            elm.addEventListener('mouseover',function(ev){
                ev.target.value=origv; // in case they choose cut instead of copy the value will be preserved
                ev.target.select();
            })
        })(as[asi], as[asi].value);
    }

    document.getElementById('helpTrigger').addEventListener('click',toggleNextSiblingVisiblity);

});
