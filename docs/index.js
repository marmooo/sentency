const playPanel=document.getElementById('playPanel');const countPanel=document.getElementById('countPanel');const scorePanel=document.getElementById('scorePanel');const startButton=document.getElementById('startButton');const answer=document.getElementById('answer');const romaNode=document.getElementById('roma');const japanese=document.getElementById('japanese');const choices=document.getElementById('choices');const gradeOption=document.getElementById('gradeOption');const infoPanel=document.getElementById('infoPanel');const resultNode=document.getElementById('result');const aa=document.getElementById('aa');const gameTime=180;const tmpCanvas=document.createElement('canvas');const mode=document.getElementById('mode');let typeTimer;const bgm=new Audio('bgm.mp3');bgm.volume=0.1;bgm.loop=true;let wordsCount=0;let problemCount=0;let errorCount=0;let mistaken=false;let problems=[];let englishVoices=[];let keyboardAudio,correctAudio,incorrectAudio,endAudio;loadAudios();const AudioContext=window.AudioContext||window.webkitAudioContext;const audioContext=new AudioContext();function clearConfig(){localStorage.clear();}
function loadConfig(){if(localStorage.getItem('darkMode')==1){document.documentElement.dataset.theme='dark';}
if(localStorage.getItem('bgm')!=1){document.getElementById('bgmOn').classList.add('d-none');document.getElementById('bgmOff').classList.remove('d-none');}}
loadConfig();function toggleBGM(){if(localStorage.getItem('bgm')==1){document.getElementById('bgmOn').classList.add('d-none');document.getElementById('bgmOff').classList.remove('d-none');localStorage.setItem('bgm',0);bgm.pause();}else{document.getElementById('bgmOn').classList.remove('d-none');document.getElementById('bgmOff').classList.add('d-none');localStorage.setItem('bgm',1);bgm.play();}}
function toggleDarkMode(){if(localStorage.getItem('darkMode')==1){localStorage.setItem('darkMode',0);delete document.documentElement.dataset.theme;}else{localStorage.setItem('darkMode',1);document.documentElement.dataset.theme='dark';}}
function toggleOverview(){var overview=document.getElementById('overview');if(overview.dataset&&overview.dataset.collapse=='true'){overview.dataset.collapse='false';overview.classList.add('d-none');overview.classList.add('d-sm-block');}else{overview.dataset.collapse='true';overview.classList.remove('d-none');overview.classList.remove('d-sm-block');}}
function playAudio(audioBuffer,volume){const audioSource=audioContext.createBufferSource();audioSource.buffer=audioBuffer;if(volume){const gainNode=audioContext.createGain();gainNode.gain.value=volume;gainNode.connect(audioContext.destination);audioSource.connect(gainNode);audioSource.start();}else{audioSource.connect(audioContext.destination);audioSource.start();}}
function unlockAudio(){audioContext.resume();}
function loadAudio(url){return fetch(url).then(response=>response.arrayBuffer()).then(arrayBuffer=>{return new Promise((resolve,reject)=>{audioContext.decodeAudioData(arrayBuffer,(audioBuffer)=>{resolve(audioBuffer);},(err)=>{reject(err);});});});}
function loadAudios(){promises=[loadAudio('keyboard.mp3'),loadAudio('correct.mp3'),loadAudio('cat.mp3'),loadAudio('end.mp3'),];Promise.all(promises).then(audioBuffers=>{keyboardAudio=audioBuffers[0];correctAudio=audioBuffers[1];incorrectAudio=audioBuffers[2];endAudio=audioBuffers[3];});}
function loadVoices(){const allVoicesObtained=new Promise(function(resolve,reject){let voices=speechSynthesis.getVoices();if(voices.length!==0){resolve(voices);}else{speechSynthesis.addEventListener("voiceschanged",function(){voices=speechSynthesis.getVoices();resolve(voices);});}});allVoicesObtained.then(voices=>{englishVoices=voices.filter(voice=>voice.lang=='en-US');});}
loadVoices();function loopVoice(text,n){speechSynthesis.cancel();var msg=new SpeechSynthesisUtterance(text);msg.voice=englishVoices[Math.floor(Math.random()*englishVoices.length)];msg.lang='en-US';for(var i=0;i<n;i++){speechSynthesis.speak(msg);}}
function loadProblems(){var grade=gradeOption.selectedIndex+3;if(grade>0){fetch('data/'+mode.textContent.toLowerCase()+'/'+grade+'.tsv').then(function(response){return response.text();}).then(function(tsv){problems=tsv.split('\n').slice(0,-1).map(line=>{const[en,jaStr]=line.split('\t');const ja=jaStr.split('|').slice(0,3).join('\n');return{en:en,ja:ja};});}).catch(function(err){console.error(err);});}}
function fixTypeStyle(currNode,word){currNode.textContent=word;typeNormal(currNode);}
function appendWord(currNode,word){const span=document.createElement('span');span.textContent=word;currNode.parentNode.insertBefore(span,currNode.NextSibling);}
function typeNormal(currNode){currNode.style.visibility='visible';playAudio(keyboardAudio);currNode.style.color='silver';normalCount+=1;}
function nextProblem(){playAudio(correctAudio);wordsCount=0;problemCount+=1;if(mistaken){errorCount+=1;}else{resultNode.lastChild.classList.remove('table-danger');}
mistaken=false;selectable();}
function replay(){clearInterval(typeTimer);initTime();loadProblems();countdown();problemCount=errorCount=0;countPanel.hidden=false;scorePanel.hidden=true;while(resultNode.firstChild){resultNode.removeChild(resultNode.firstChild);}}
function calcAAOuterSize(){var headerHeight=document.getElementById('header').offsetHeight;var typePanelHeight=document.getElementById('typePanel').offsetHeight;return document.documentElement.clientHeight-headerHeight-infoPanel.offsetHeight-typePanelHeight;}
function resizeFontSize(node){function getTextWidth(text,font){var context=tmpCanvas.getContext("2d");context.font=font;var metrics=context.measureText(text);return metrics.width;}
function getTextRect(text,fontSize,font,lineHeight){var lines=text.split('\n');var maxWidth=0;var fontConfig=fontSize+'px '+font;for(var i=0;i<lines.length;i++){var width=getTextWidth(lines[i],fontConfig);if(maxWidth<width){maxWidth=width;}}
return[maxWidth,fontSize*lines.length*lineHeight];}
function getPaddingRect(style){var width=parseFloat(style.paddingLeft)+parseFloat(style.paddingRight);var height=parseFloat(style.paddingTop)+parseFloat(style.paddingBottom);return[width,height];}
var style=getComputedStyle(node);var font=style.fontFamily;var fontSize=parseFloat(style.fontSize);var lineHeight=parseFloat(style.lineHeight)/fontSize;var nodeHeight=calcAAOuterSize();var nodeWidth=infoPanel.clientWidth;var nodeRect=[nodeWidth,nodeHeight];var textRect=getTextRect(node.innerText,fontSize,font,lineHeight);var paddingRect=getPaddingRect(style);var rowFontSize=fontSize*(nodeRect[0]-paddingRect[0])/textRect[0]*0.90;var colFontSize=fontSize*(nodeRect[1]-paddingRect[1])/textRect[1]*0.90;if(colFontSize<rowFontSize){node.style.fontSize=colFontSize+'px';}else{node.style.fontSize=rowFontSize+'px';}}
function getRandomInt(min,max){var min=Math.ceil(min);var max=Math.floor(max);return Math.floor(Math.random()*(max-min))+min;}
function shuffle(array){for(var i=array.length-1;i>0;i--){var r=Math.floor(Math.random()*(i+1));var tmp=array[i];array[i]=array[r];array[r]=tmp;}
return array;}
function capitalizeFirstLetter(string){return string.charAt(0).toUpperCase()+string.slice(1);}
function selectableWordClickEvent(){if(this.parentNode==romaNode){if(this.textContent!='　'){const romaChildren=[...romaNode.children];const choicesChildren=[...choices.children];const romaPos=romaChildren.findIndex(e=>e==this);let count=0;romaChildren.slice(romaPos).forEach(e=>{if(e.hasAttribute('data-pos')){const pos=parseInt(e.dataset.pos);choicesChildren[pos].classList.remove('d-none');e.textContent='　';e.removeAttribute('data-id');e.removeAttribute('data-pos');count+=1;}});wordsCount-=count;}}else{let pos=wordsCount;const romaChildren=[...romaNode.children];let roma=this.textContent;if(pos==0){roma=capitalizeFirstLetter(roma);}else{const prev=romaChildren[pos].previousSibling;if(prev.nodeType==Node.TEXT_NODE){switch(prev.textContent){case '.':case '!':case '?':roma=capitalizeFirstLetter(roma);}}}
romaChildren[pos].textContent=roma;romaChildren[pos].dataset.id=this.dataset.id;romaChildren[pos].dataset.pos=this.dataset.pos;this.classList.add('d-none');wordsCount+=1;if(wordsCount==choices.children.length){const correctAll=romaChildren.every((e,i)=>{return e.dataset.id.split(',').some(id=>i==parseInt(id));});if(correctAll){nextProblem();}else{mistaken=true;playAudio(incorrectAudio);}}else{playAudio(keyboardAudio);}}}
function initSelectableWord(){const span=document.createElement('span');span.className='btn btn-light btn-lg m-1 px-2 choice';return span;}
const selectableWord=initSelectableWord();function setChoices(roma,choices){let words=roma.split(/\s+/).map(word=>word.replace(/([0-9a-zA-Z]+)[,.!?]$/,'$1')).map(word=>{switch(word){case 'I':case 'X':return word;default:return word.toLowerCase();}});let positions={};words.forEach((word,i)=>{if(word in positions){positions[word].push(i);}else{positions[word]=[i];}});const indexedWords=words.map((word,id)=>{return{en:word,id:positions[word]};});const shuffled=shuffle(indexedWords);while(choices.firstChild){choices.removeChild(choices.firstChild);}
shuffled.forEach((word,pos)=>{const span=selectableWord.cloneNode(true);span.onclick=selectableWordClickEvent;span.textContent=word.en;span.dataset.id=word.id.join(',');span.dataset.pos=pos;choices.appendChild(span);});}
function setRoma(roma,choices,romaNode){while(romaNode.firstChild){romaNode.removeChild(romaNode.firstChild);}
roma.split(/\s+/).forEach(word=>{const span=selectableWord.cloneNode(true);span.onclick=selectableWordClickEvent;span.textContent='　';romaNode.appendChild(span);if(word.match(/[0-9a-zA-Z]+[,.!?]/)){const symbol=word[word.length-1];const text=document.createTextNode(symbol);romaNode.appendChild(text);}});}
function addResult(en,ja){const tr=document.createElement('tr');tr.className='table-danger';const enNode=document.createElement('td');const jaNode=document.createElement('td');enNode.textContent=en;jaNode.textContent=ja;tr.appendChild(enNode);tr.appendChild(jaNode);resultNode.appendChild(tr);}
function selectable(){const problem=problems[getRandomInt(0,problems.length)];japanese.textContent=problem.ja;const roma=problem.en;if(mode.textContent=='EASY'){loopVoice(roma,2);}
answer.classList.add('d-none');answer.textContent=roma;setChoices(roma,choices);setRoma(roma,choices,romaNode);addResult(problem.en,problem.ja)}
function countdown(){problemCount=errorCount=0;playPanel.classList.add('d-none');countPanel.hidden=false;scorePanel.hidden=true;counter.innerText=3;var timer=setInterval(function(){var counter=document.getElementById('counter');var colors=['skyblue','greenyellow','violet','tomato'];if(parseInt(counter.innerText)>1){var t=parseInt(counter.innerText)-1;counter.style.backgroundColor=colors[t];counter.innerText=t;}else{clearInterval(timer);countPanel.hidden=true;scorePanel.hidden=true;playPanel.classList.remove('d-none');selectable();startTypeTimer();if(localStorage.getItem('bgm')==1){bgm.play();}}},1000);}
function startGame(){clearInterval(typeTimer);startButton.removeEventListener('click',startGame);startButton.addEventListener('click',replay);initTime();loadProblems();countdown();}
function startTypeTimer(){var timeNode=document.getElementById('time');typeTimer=setInterval(function(){var arr=timeNode.innerText.split('秒 /');var t=parseInt(arr[0]);if(t>0){timeNode.innerText=(t-1)+'秒 /'+arr[1];}else{clearInterval(typeTimer);bgm.pause();playAudio(endAudio);playPanel.classList.add('d-none');countPanel.hidden=true;scorePanel.hidden=false;scoring();}},1000);}
function downTime(n){const timeNode=document.getElementById('time');const arr=timeNode.innerText.split('秒 /');const t=parseInt(arr[0]);const downedTime=t-n;if(downedTime<0){timeNode.innerText='0秒 /'+arr[1];}else{timeNode.innerText=downedTime+'秒 /'+arr[1];}}
function initTime(){document.getElementById('time').innerText=gameTime+'秒 / '+gameTime+'秒';}
function scoring(){document.getElementById('score').innerText=problemCount-errorCount;document.getElementById('count').innerText=problemCount;}
document.getElementById('answerButton').onclick=function(){answer.classList.remove('d-none');}
document.getElementById('voice').onclick=function(){loopVoice(answer.textContent,1);};startButton.addEventListener('click',startGame);gradeOption.addEventListener('change',function(){initTime();clearInterval(typeTimer);});setChoices(romaNode.textContent,choices);mode.onclick=function(){mode.textContent=(mode.textContent=='EASY')?'HARD':'EASY';};document.addEventListener('click',unlockAudio,{once:true,useCapture:true});