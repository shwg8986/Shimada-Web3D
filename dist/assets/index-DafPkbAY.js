import{S as le,P as Oe,W as Fe,a as We,b as ee,c as Xe,T as te,R as Ye,V as m,d as He,e as Ve,A as _e,D as Ge,M as h,n as Je,E as y,f as ue,g as me,F as Ne,h as he,i as ne,j as oe,k as U,C as Ze,l as pe,L as G,m as fe,o as we,B as ve,p as $e,q as Qe,r as Ke,s as et,t as tt}from"./vendor-BH_OlmQq.js";import{initializeApp as nt}from"https://www.gstatic.com/firebasejs/10.12.1/firebase-app.js";import{getAnalytics as ot}from"https://www.gstatic.com/firebasejs/10.12.1/firebase-analytics.js";(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))n(o);new MutationObserver(o=>{for(const i of o)if(i.type==="childList")for(const c of i.addedNodes)c.tagName==="LINK"&&c.rel==="modulepreload"&&n(c)}).observe(document,{childList:!0,subtree:!0});function t(o){const i={};return o.integrity&&(i.integrity=o.integrity),o.referrerPolicy&&(i.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?i.credentials="include":o.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function n(o){if(o.ep)return;o.ep=!0;const i=t(o);fetch(o.href,i)}})();let p,r,D,J,C,I,N,ye;const ge={width:window.innerWidth,height:window.innerHeight},ie=new m(0,10,0);function it(){p=new le}function at(){r=new Oe(75,window.innerWidth/window.innerHeight,.1,1e3),r.position.set(ie.x,ie.y,ie.z)}function rt(){const e=document.getElementById("canvasContainer");D=new Fe({canvas:e,antialias:!0}),D.setSize(ge.width,ge.height),D.setPixelRatio(window.devicePixelRatio)}function st(){document.getElementById("canvasContainer")?(J=new We(r,document.body),p.add(J.getObject())):console.error("Canvas element not found")}function Le(){ye=document.getElementById("compass-svg").querySelector("line")}function ct(){const e=new ee(1e4,1e4);C=new Xe(e,{textureWidth:512,textureHeight:512,waterNormals:new te().load(new URL(""+new URL("waternormals-Dfm-ILpY.jpg",import.meta.url).href,import.meta.url).toString(),t=>{t.wrapS=t.wrapT=Ye}),sunDirection:new m,sunColor:16777215,waterColor:7695,distortionScale:3.7,fog:p.fog!==void 0}),C.rotation.x=-Math.PI/2,p.add(C)}function dt(){I=new He,I.scale.setScalar(1e4),p.add(I);const e=I.material.uniforms;e.turbidity.value=1,e.rayleigh.value=2,e.mieCoefficient.value=.01,e.mieDirectionalG.value=.8,lt()}function lt(){const e={elevation:2,azimuth:180},t=new Ve(D),n=new le;let o;const i=h.degToRad(90-e.elevation),c=h.degToRad(e.azimuth);N=new m,N.setFromSphericalCoords(1,i,c),I.material.uniforms.sunPosition.value.copy(N),C.material.uniforms.sunDirection.value.copy(N).normalize(),o!==void 0&&o.dispose(),n.add(I),o=t.fromScene(n),p.add(I),p.environment=o.texture}function ut(){const e=new _e(16777215,.5);p.add(e);const t=new Ge(16777215,.4);t.position.set(1,.55,5),p.add(t)}const mt=`
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`,ht=`
  uniform sampler2D videoTexture;
  varying vec2 vUv;
  void main() {
    vec2 uv = vUv;
    gl_FragColor = texture2D(videoTexture, uv);
  }
`,Me=`
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`,xe=`
    uniform sampler2D videoTexture;
    varying vec2 vUv;
    void main() {
      vec2 uv = vUv;
      uv.x = 1.0 - uv.x; // \u6C34\u5E73\u65B9\u5411\u306B\u53CD\u8EE2
      gl_FragColor = texture2D(videoTexture, uv);
    }
`;let z=!1,q=!1,j=!1,O=!1;function be(){const e=new y(0,r.rotation.y,0,"YXZ");r.rotation.copy(e)}function pt(e){r.fov+=e.deltaY*.05,r.fov=Math.max(20,Math.min(120,r.fov)),r.updateProjectionMatrix()}function ft(e){if(e.touches.length==2){const t=e.touches[0].pageX-e.touches[1].pageX,n=e.touches[0].pageY-e.touches[1].pageY,o=Math.sqrt(t*t+n*n);if(this.lastTouchDistance!==void 0){const i=o-this.lastTouchDistance;r.fov-=i*.1,r.fov=Math.max(20,Math.min(120,r.fov)),r.updateProjectionMatrix()}this.lastTouchDistance=o}}function wt(){this.lastTouchDistance=void 0}function vt(){const e=document.getElementById("joystickContainer");if(e){const t=Je.create({zone:e,mode:"static",position:{left:"50%",bottom:"50%"},color:"#fff"});t.on("start",()=>{be()}),t.on("move",(n,o)=>{z=o.direction.y==="up",q=o.direction.y==="down",j=o.direction.x==="left",O=o.direction.x==="right"}),t.on("end",()=>{z=q=j=O=!1})}}function yt(e){switch(be(),e.key){case"w":case"ArrowUp":z=!0;break;case"s":case"ArrowDown":q=!0;break;case"a":case"ArrowLeft":j=!0;break;case"d":case"ArrowRight":O=!0;break}}function gt(e){switch(e.key){case"w":case"ArrowUp":z=!1;break;case"s":case"ArrowDown":q=!1;break;case"a":case"ArrowLeft":j=!1;break;case"d":case"ArrowRight":O=!1;break}}function F(e,t,n){const o=r.position.clone(),i=r.rotation.clone(),c=performance.now(),d=new m(0,0,20).applyEuler(t),l=e.clone().add(d);function w(s){const a=s-c,g=Math.min(a/300,1);r.position.lerpVectors(o,l,g),r.rotation.set(h.lerp(i.x,t.x,g),h.lerp(i.y,t.y,g),h.lerp(i.z,t.z,g)),g<1?requestAnimationFrame(w):n()}requestAnimationFrame(w)}function Lt(e,t,n){const o=r.position.clone(),i=r.rotation.clone(),c=performance.now(),d=e.clone();function l(w){const s=w-c,a=Math.min(s/300,1);r.position.lerpVectors(o,d,a),r.rotation.set(h.lerp(i.x,t.x,a),h.lerp(i.y,t.y,a),h.lerp(i.z,t.z,a)),a<1?requestAnimationFrame(l):n()}requestAnimationFrame(l)}function ae(e){const t=document.getElementById("overlay");if(t){t.classList.add("active"),document.querySelectorAll(".content-item").forEach(i=>i.classList.remove("active"));const n=document.getElementById(e);n?n.classList.add("active"):console.error(`Content with ID ${e} not found.`),document.querySelectorAll(".tab").forEach(i=>i.classList.remove("active"));const o=document.querySelector(`[id="tab${e.replace("content","")}"]`);o?o.classList.add("active"):console.error(`Tab for content ID ${e} not found.`)}else console.error("Overlay not found.")}function Ee(){const e=document.getElementById("overlay");e&&(e.classList.remove("active"),document.querySelectorAll(".content-item").forEach(t=>t.classList.remove("active")))}function Mt(e){if(Z())return;const t=X.find(n=>n.userData.contentId===e);if(t){$(!0);const n=t.rotation.clone();F(t.position,n,()=>{ae(e),$(!1)})}}const xt=()=>{if(Z())return;const e=document.querySelector(".content-item.active"),t=Array.from(document.querySelectorAll(".content-item"));if(!e)return;const n=(t.indexOf(e)+1)%t.length,o=t[n];o&&Pe(o.id)},bt=()=>{if(Z())return;const e=document.querySelector(".content-item.active"),t=Array.from(document.querySelectorAll(".content-item"));if(!e)return;const n=(t.indexOf(e)-1+t.length)%t.length,o=t[n];o&&Pe(o.id)},Pe=e=>{const t=Et(e);if(t){$(!0);const n=t.rotation.clone();F(t.position,n,()=>{ae(e),$(!1)})}},Et=e=>{const t=[...Y,...H,...X];for(const n of t)if(n.userData.contentId===e)return n;return null},Pt=e=>{document.addEventListener("DOMContentLoaded",()=>{document.querySelectorAll(".tab").forEach(n=>{n.addEventListener("click",()=>{if(Z())return;const o=n.id.replace("tab","content");e(o)})}),document.querySelectorAll(".next-button").forEach(n=>{n.addEventListener("click",xt)}),document.querySelectorAll(".prev-button").forEach(n=>{n.addEventListener("click",bt)});const t=document.getElementById("overlay");t==null||t.addEventListener("click",n=>{n.target===t&&Ee()}),document.getElementById("close-button").addEventListener("click",Ee)})};let Rt=!1,St=!1,W=!1;const Re=new ue,re=new me;function Se(e,t){if(W||Rt||St)return;re.x=e/window.innerWidth*2-1,re.y=-(t/window.innerHeight)*2+1,Re.setFromCamera(re,r);const n=Re.intersectObjects([...Y,...H,...X]);if(n.length>0){const o=n[0].object;if(o.userData.video||o.userData.isImage)W=!0,o.position.clone(),Lt(o.position,o.rotation,()=>{W=!1});else if(document.getElementById("overlay")){const i=o.userData.contentId;if(i){W=!0;const c=o.rotation.clone();F(o.position,c,()=>{ae(i),W=!1})}}}}function se(){const e=navigator.userAgent||navigator.vendor;return/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(e)}let k,A;const X=[],Y=[],De=[],H=[],Ie=[];function V(e,t,n,o,i,c,d,l,w){const s=document.createElement("video");s.src=l,s.loop=!0,s.muted=!0,s.crossOrigin="anonymous",s.setAttribute("playsinline",""),s.setAttribute("preload","auto"),s.play();const a=new he(s),g=new ne({uniforms:{videoTexture:{value:a}},vertexShader:mt,fragmentShader:ht,side:oe}),f=new ee(e,t),v=new U(f,g);v.position.copy(i),v.rotation.copy(c),v.userData.contentId=d,p.add(v),X.push(v);const x=document.createElement("canvas"),M=x.getContext("2d");x.width=512,x.height=512,M.font="64px sans-serif",M.fillStyle=n,M.lineWidth=3,M.strokeStyle=o,M.textAlign="center",M.textBaseline="middle",M.fillText(w,256,256);const B=new Ze(x),Q=new pe({map:B,transparent:!0}),K=new ee(e,t),P=new U(K,Q);return P.position.copy(i),P.rotation.copy(c),P.position.z+=c.y>Math.PI/2&&c.y<3*Math.PI/2?-.1:.1,p.add(P),s.addEventListener("loadeddata",()=>{const S=document.createElement("canvas"),je=S.getContext("2d");se()?(S.width=s.videoWidth/4,S.height=s.videoHeight/4):(S.width=s.videoWidth,S.height=s.videoHeight),je.drawImage(s,0,0,S.width,S.height),a.needsUpdate=!0}),v}function ce(e,t,n,o,i,c){const d=document.createElement("video");d.src=o,d.loop=!0,d.muted=!0,d.crossOrigin="anonymous",d.setAttribute("playsinline",""),d.setAttribute("preload","true"),d.setAttribute("autoplay","true"),d.pause();const l=new he(d);l.minFilter=G,l.magFilter=G,l.format=fe,d.addEventListener("loadeddata",()=>{l.needsUpdate=!0});const w=new we(e,32,32),s=new ne({uniforms:{videoTexture:{value:l}},vertexShader:Me,fragmentShader:xe,side:ve}),a=new U(w,s);a.position.copy(t),a.rotation.copy(n),a.userData={video:d,isPlaying:!1,radius:e},p.add(a),Y.push(a),De.push(t.clone()),Ue(i,c,1,0).forEach((f,v)=>{f.position.set(t.x,t.y,t.z),f.rotation.set(n.x,n.y,n.z),p.add(f),a.userData[`textMesh${v}`]=f});const g=ke(t,n,e,5,2,5);return a.userData.metalBox=g,a}function _(e,t,n,o,i,c){const d=new te;d.setCrossOrigin("anonymous"),d.load(o,l=>{l.minFilter=G,l.magFilter=G,l.format=fe;const w=new ne({uniforms:{videoTexture:{value:l}},vertexShader:Me,fragmentShader:xe,side:ve}),s=new we(e,32,32),a=new U(s,w);a.position.copy(t),a.rotation.copy(n),a.userData={isImage:!0,radius:e},p.add(a),H.push(a),Ie.push(t.clone()),Ue(i,c,1,0).forEach((f,v)=>{f.position.set(t.x,t.y,t.z),f.rotation.set(n.x,n.y,n.z),p.add(f),a.userData[`textMesh${v}`]=f});const g=ke(t,n,e,5,2,5);a.userData.metalBox=g})}function Ue(e,t,n,o){const i=e.split("").map(d=>{const l=new $e(d,{font:t,size:n,depth:.5}),w=new pe({color:o,side:oe});return new U(l,w)}),c=n*.6;return i.forEach((d,l)=>{d.position.x=l*c}),i}function ke(e,t,n,o,i,c){const d=new Qe(o,i,c),l=new te,w=new Ke({side:oe,roughness:.2,metalness:.7,metalnessMap:l.load(new URL(""+new URL("stone-CjpFpks5.jpg",import.meta.url).href,import.meta.url).toString()),emissive:3355443,emissiveIntensity:.4}),s=new U(d,w);return s.position.copy(e),s.position.set(e.x,e.y-(n+i/2+.1),e.z),s.rotation.copy(t),p.add(s),s}function Dt(){const e=new Ne;e.setResourcePath(new URL(""+new URL("Blury-BoMjJBPx.jpg",import.meta.url).href,import.meta.url).toString()),e.setResourcePath(new URL(""+new URL("Aperture-icon-BZvJus-2.png",import.meta.url).href,import.meta.url).toString()),e.load(new URL(""+new URL("drone_costum-DJmc3HXv.fbx",import.meta.url).href,import.meta.url).toString(),t=>{t.scale.set(.015,.015,.015),k=t,A=t.clone(),p.add(k),p.add(A)})}const u=50;function It(){V(20,10,"#fff","#000",new m(-u*Math.sin(36*(Math.PI/180)),7,-u*Math.sin(54*(Math.PI/180))),new y(0,h.degToRad(36),0),"content0",new URL(""+new URL("unity-CzQo0H4V.mp4",import.meta.url).href,import.meta.url).toString(),"Profile"),V(20,10,"#fff","#000",new m(-u*Math.sin(72*(Math.PI/180)),7,u*Math.sin(18*(Math.PI/180))),new y(0,h.degToRad(108),0),"content1",new URL(""+new URL("glasgow-DdGekOAD.mp4",import.meta.url).href,import.meta.url).toString(),"Experience"),V(20,10,"#fff","#000",new m(0,7,u),new y(0,h.degToRad(180),0),"content2",new URL(""+new URL("brain-BariFs9z.mp4",import.meta.url).href,import.meta.url).toString(),"Education"),V(20,10,"#fff","#000",new m(u*Math.sin(72*(Math.PI/180)),7,u*Math.sin(18*(Math.PI/180))),new y(0,h.degToRad(252),0),"content3",new URL(""+new URL("labMeetingVR-BhJ4cuSZ.mp4",import.meta.url).href,import.meta.url).toString(),"Publication"),V(20,10,"#fff","#000",new m(u*Math.sin(36*(Math.PI/180)),7,-u*Math.sin(54*(Math.PI/180))),new y(0,h.degToRad(324),0),"content4",new URL(""+new URL("teamLab-bAjd3bjn.mp4",import.meta.url).href,import.meta.url).toString(),"Link")}function Ut(){ce(5,new m(0,8,-u),new y(0,0,0),new URL(""+new URL("tourEiffel3d_st-D3ilD-n_.MP4",import.meta.url).href,import.meta.url).toString(),"Paris Video",E),ce(5,new m(u*Math.sin(72*(Math.PI/180)),8,-u*Math.sin(18*(Math.PI/180))),new y(0,h.degToRad(288),0),new URL(""+new URL("cruiseThai3d-ChPmiQXw.mp4",import.meta.url).href,import.meta.url).toString(),"Bangkok Video",E),ce(5,new m(-u*Math.sin(72*(Math.PI/180)),8,-u*Math.sin(18*(Math.PI/180))),new y(0,h.degToRad(72),0),new URL(""+new URL("warsawOld23d_st-CsOOhhWi.MP4",import.meta.url).href,import.meta.url).toString(),"Warsaw Video",E)}function kt(){_(5,new m(0,8,-u),new y(0,0,0),new URL(""+new URL("paris-CH1hZzYp.jpg",import.meta.url).href,import.meta.url).toString(),"Paris Photo",E),_(5,new m(u*Math.sin(72*(Math.PI/180)),8,-u*Math.sin(18*(Math.PI/180))),new y(0,h.degToRad(288),0),new URL(""+new URL("bangkok-B2xbuX_1.JPG",import.meta.url).href,import.meta.url).toString(),"Bangkok Photo",E),_(5,new m(-u*Math.sin(72*(Math.PI/180)),8,-u*Math.sin(18*(Math.PI/180))),new y(0,h.degToRad(72),0),new URL(""+new URL("warsaw-G8Nwwzp7.JPG",import.meta.url).href,import.meta.url).toString(),"Warsaw Photo",E)}function At(){_(5,new m(-u*Math.sin(36*(Math.PI/180)),8,u*Math.sin(54*(Math.PI/180))),new y(0,h.degToRad(144),0),new URL(""+new URL("vitre-CSAeGasA.JPG",import.meta.url).href,import.meta.url).toString(),"Vitre Photo",E),_(5,new m(u*Math.sin(36*(Math.PI/180)),8,u*Math.sin(54*(Math.PI/180))),new y(0,h.degToRad(216),0),new URL(""+new URL("singapore-fcHVq9ns.JPG",import.meta.url).href,import.meta.url).toString(),"Singapore Photo",E)}function Tt(e){k&&A&&(k.position.x=100*Math.sin(e*.5)+5*Math.cos(e*1.2),k.position.y=60+5*Math.sin(e*.7),k.position.z=-200*Math.cos(e*.3)+-5*Math.sin(e*1.5),A.position.x=-50*Math.sin(e*.5)-10*Math.cos(e*1.2),A.position.y=90+10*Math.sin(e*.7),A.position.z=100*Math.cos(e*.3)+10*Math.sin(e*1.5))}function Bt(){const e=new m;r.getWorldDirection(e);const t=Math.atan2(e.x,e.z)*(180/Math.PI)+180;ye.style.transform=`rotate(${-t}deg)`}function Ct(e){z&&e.moveForward(.2),q&&e.moveForward(-.2),j&&e.moveRight(-.2),O&&e.moveRight(.2)}let zt=[],qt=[];function Ae(e,t,n,o,i,c,d){const l=document.getElementById("back-button"),w=document.querySelector(".tabs");if(!l||!w){console.error("Required elements are not found in the DOM.");return}const s=o*Math.sin(i*n);e.forEach((a,g)=>{const f=t[g],v=r.position.distanceTo(a.position)<a.userData.radius;if(c.length<e.length&&c.push(!v),v!==c[g]&&(d(a,v),c[g]=v),v)a.position.y=f.y,a.userData.metalBox&&(a.userData.metalBox.position.y=f.y-a.userData.radius-1);else{if(a.position.y=f.y+s,a.userData.metalBox){const x=a.geometry.parameters.radius;a.userData.metalBox.position.set(f.x,f.y-x-2+s,f.z)}Object.keys(a.userData).forEach(x=>{if(x.startsWith("textMesh")){const M=a.userData[x],B=6,Q=1.5,K=parseInt(x.replace("textMesh",""),10),P=Q*n-K*.2;M.position.x=a.position.x+B*Math.cos(P),M.position.z=a.position.z+B*Math.sin(P),M.position.y=a.position.y+B*Math.sin(P)}})}})}function jt(e,t){const n=document.getElementById("back-button"),o=document.querySelector(".tabs");t?(n.style.display="block",n.style.visibility="visible",o.style.display="none",e.userData.isPlaying||(e.userData.video.play(),e.userData.isPlaying=!0)):(n.style.display="none",n.style.visibility="hidden",o.style.display="block",e.userData.isPlaying&&(e.userData.video.pause(),e.userData.isPlaying=!1))}function Ot(e){const t=document.getElementById("back-button"),n=document.querySelector(".tabs");e?(t.style.display="block",t.style.visibility="visible",n.style.display="none"):(t.style.display="none",t.style.visibility="hidden",n.style.display="block")}function Ft(e,t,n,o,i){Ae(e,t,n,o,i,zt,jt)}function Wt(e,t,n,o,i){Ae(e,t,n,o,i,qt,(c,d)=>Ot(d))}const T={width:window.innerWidth,height:window.innerHeight},Te=new m(0,10,0);let b=!1,R=null,L={x:0,y:0};const Be=new ue,de=new me;function Xt(e){if(b){const t=e.clientX-L.x,n=e.clientY-L.y;L={x:e.clientX,y:e.clientY},r.rotation.order="YXZ",r.rotation.y-=t*.005,r.rotation.x-=n*.005}}function Yt(e){b=!1,L={x:e.clientX,y:e.clientY},R=window.setTimeout(()=>{b=!0},150)}function Ce(){R!==null&&(clearTimeout(R),R=null),b||Se(L.x,L.y),b=!1}function Ht(e){if(b&&e.touches.length===1){const t=e.touches[0].clientX-L.x,n=e.touches[0].clientY-L.y;L={x:e.touches[0].clientX,y:e.touches[0].clientY},r.rotation.order="YXZ",r.rotation.y-=t*.005,r.rotation.x-=n*.005}}function Vt(e){e.touches.length===1&&(b=!1,L={x:e.touches[0].clientX,y:e.touches[0].clientY},R=window.setTimeout(()=>{b=!0},100))}function ze(){R!==null&&(clearTimeout(R),R=null),b||Se(L.x,L.y),b=!1}function _t(){T.width=window.innerWidth,T.height=window.innerHeight,r.aspect=T.width/T.height,r.updateProjectionMatrix(),D.setSize(T.width,T.height),D.setPixelRatio(window.devicePixelRatio)}function Gt(e){de.x=e.clientX/window.innerWidth*2-1,de.y=-(e.clientY/window.innerHeight)*2+1,Be.setFromCamera(de,r);const t=Be.intersectObjects([...Y,...H,...X]);document.body.style.cursor=t.length>0?"pointer":"default"}function Jt(){const e=document.getElementById("canvasContainer");document.addEventListener("DOMContentLoaded",()=>{const i=document.querySelector(".header");se()?(i.textContent="\u3057\u307E\u3060\u306EWeb3D - \u30B9\u30DE\u30DB\u7248",i.classList.add("mobile-header")):i.textContent="\u3057\u307E\u3060\u306EWeb3D - PC\u7248"}),window.addEventListener("load",Le),e.addEventListener("mousedown",Yt,{passive:!0}),e.addEventListener("mousemove",Xt,{passive:!0}),e.addEventListener("mouseup",Ce,{passive:!0}),e.addEventListener("mouseleave",Ce,{passive:!0}),e.addEventListener("touchstart",Vt,{passive:!0}),e.addEventListener("touchmove",Ht,{passive:!0}),e.addEventListener("touchend",ze,{passive:!0}),e.addEventListener("touchcancel",ze,{passive:!0}),document.addEventListener("keydown",yt,{passive:!0}),document.addEventListener("keyup",gt,{passive:!0}),e.addEventListener("wheel",pt,{passive:!0}),e.addEventListener("touchmove",ft,{passive:!0}),e.addEventListener("touchend",wt,{passive:!0});function t(i){r.fov=i,r.updateProjectionMatrix()}const n=document.querySelector(".header");n&&n.addEventListener("click",()=>{F(Te,new y(0,0,0),()=>{}),t(75)});const o=document.getElementById("back-button");o&&o.addEventListener("click",()=>{F(Te,new y(0,0,0),()=>{}),t(75)}),window.addEventListener("resize",_t),window.addEventListener("mousemove",Gt),vt()}function Nt(){document.addEventListener("DOMContentLoaded",()=>{document.querySelectorAll(".accordion").forEach(e=>{const t=e.querySelector(".accordion-header"),n=e.querySelector(".accordion-content"),o=e.querySelector(".accordion-toggle");t&&n&&o&&t.addEventListener("click",()=>{n.classList.contains("active")?(n.classList.remove("active"),o.innerHTML="&#9650;"):(n.classList.add("active"),o.innerHTML="&#9660;")})})})}let E,qe=!1;function Z(){return qe}function $(e){qe=e}function Zt(){try{it(),at(),rt(),st(),Le(),ct(),dt(),Nt(),Jt(),$t(),Kt(),Pt(Mt)}catch(e){console.error("Initialization error:",e)}}function $t(){new et().load(new URL(""+new URL("helvetiker_regular.typeface-yAIZwh9g.json",import.meta.url).href,import.meta.url).toString(),e=>{E=e,Qt()})}function Qt(){It(),At(),se()?(kt(),console.log("Device is smartPhone")):(Ut(),console.log("Device is PC")),Dt(),ut()}function Kt(){const e=new tt;function t(){const n=e.getElapsedTime(),o=1.5,i=1;Tt(n),Ft(Y,De,n,o,i),Wt(H,Ie,n,o,i),J&&Ct(J),Bt(),D.render(p,r),requestAnimationFrame(t),C.material.uniforms.time.value+=1/60}t()}Zt();const en={apiKey:"AIzaSyC9N9indfhDVY67-U8Xr8l9W6QyVR7am1s",authDomain:"shimada-web3d.firebaseapp.com",projectId:"shimada-web3d",storageBucket:"shimada-web3d.appspot.com",messagingSenderId:"766434889080",appId:"1:766434889080:web:3f5ef3a3d8ce532b70cc8d",measurementId:"G-MV6S3572EN"},tn=nt(en);ot(tn);