/* A scroll-scrubbed, real-time 3D signal. No video seeking or image-sequence loading. */
(() => {
'use strict';
const canvas=document.getElementById('signal-canvas');
const parent=canvas.parentElement;
let gl;
try{gl=canvas.getContext('webgl',{alpha:false,antialias:false,depth:false,stencil:false,powerPreference:'low-power',preserveDrawingBuffer:false})}catch{}
if(!gl){parent.classList.add('no-webgl');window.SignalFilm=null;return}
const vertex=String.raw`attribute vec2 position;void main(){gl_Position=vec4(position,0.,1.);}`;
const fragment=String.raw`
precision highp float;
uniform vec2 resolution;
uniform float progress;
uniform float clock;
uniform vec2 pointer;
uniform sampler2D studioMap;
uniform float studioMix;
const vec3 paper=vec3(0.96862745,0.97254902,0.98039216);
float ease(float a,float b,float x){return smoothstep(a,b,x);}
mat2 rot(float a){float c=cos(a),s=sin(a);return mat2(c,-s,s,c);}
float tube(vec3 q,vec2 dimensions,float roundness,float thickness){vec2 k=abs(q.xy)-dimensions;float perimeter=length(max(k,0.))+min(max(k.x,k.y),0.)-roundness;return length(vec2(perimeter,q.z))-thickness;}
// Per-pixel constants, set once in main(): the shape's orientation and which two
// silhouettes are being blended right now. shape() runs ~100 times per pixel, so
// only the two SDFs in play are evaluated and the rotations are not rebuilt.
mat2 R1,R2,R3,RQ1,RQ2;
int SA,SB;
float SM;
float fRing(vec3 p){float angle=atan(p.y,p.x);return length(vec2(length(p.xy)-(.91+.055*sin(angle*3.+clock*.14)),p.z-.22*sin(angle*2.+clock*.18)))-.205;}
float fTv(vec3 p){return tube(p,vec2(1.02,.52),.22,.12);}
float fSearch(vec3 p){return tube(p,vec2(1.02,.055),.29,.13);}
float fWeb(vec3 p){return tube(p,vec2(.98,.62),.14,.09);}
float fSeo(vec3 p){vec3 r=p;r.x*=.92;float s=length(vec2(length(r.xy)-.95,r.z))-.075;vec3 q=p;q.xy=RQ1*q.xy;q.xz=RQ2*q.xz;return min(s,length(vec2(length(q.xy)-1.2,q.z))-.065);}
float thick(int i){if(i==0)return .205;if(i==1)return .12;if(i==2)return .13;if(i==3)return .09;return .075;}
float fPart(int i,vec3 p){if(i==0)return fRing(p);if(i==1)return fTv(p);if(i==2)return fSearch(p);if(i==3)return fWeb(p);return fSeo(p);}
float shape(vec3 p){
 p.xz=R1*p.xz;p.yz=R2*p.yz;p.xy=R3*p.xy;
 float d;
 if(SM<=0.)d=fPart(SA,p);else if(SM>=1.)d=fPart(SB,p);else{
  // morph by thinning one whole shape away while the next grows in (a blended SDF of two unlike shapes tears into shards)
  float a=fPart(SA,p)+thick(SA)*1.06*smoothstep(.08,.8,SM),b=fPart(SB,p)+thick(SB)*1.06*(1.-smoothstep(.2,.92,SM));
  float h=clamp(.5+.5*(b-a)/.09,0.,1.);d=mix(b,a,h)-.09*h*(1.-h);
 }
 return d*.78;
}
vec3 normalAt(vec3 p){vec2 e=vec2(.0015,0.);return normalize(vec3(shape(p+e.xyy)-shape(p-e.xyy),shape(p+e.yxy)-shape(p-e.yxy),shape(p+e.yyx)-shape(p-e.yyx)));}
vec3 environment(vec3 r){
 float horizon=smoothstep(-.35,.7,r.y);
 vec3 col=mix(vec3(.23,.32,.49),vec3(.97,.99,1.),horizon);
 float strip=pow(max(0.,1.-abs(r.x*.76+r.z*.37-.06)),24.);
 float box=pow(max(0.,dot(r,normalize(vec3(-.7,.7,1.)))),22.);
 float darkBand=smoothstep(.05,.12,abs(r.y-.03));
 col*=.57+.43*darkBand;
 col+=vec3(.9,.94,1.)*(strip*.5+box*.7);
 vec2 mapUV=vec2(fract(atan(r.z,r.x)/6.2831853+.5+clock*.007),.5-asin(clamp(r.y,-1.,1.))/3.14159265);
 vec3 studio=pow(texture2D(studioMap,mapUV).rgb,vec3(1.65));
 studio*=1.06;
 return mix(col,studio,studioMix*.83);
}
float glassDepth(vec3 p,vec3 ray){
 float distance=.025;
 for(int i=0;i<9;i++){
  float d=shape(p+ray*distance);
  if(d>.001&&i>1)break;
  distance+=max(.014,-d*1.12);
 }
 return clamp(distance,.05,.85);
}
void main(){
 vec2 uv=(gl_FragCoord.xy-.5*resolution)/resolution.y;
 float settle=ease(.13,.25,progress)*(1.-ease(.86,.97,progress));
 float rotation=(1.-settle)*(.45+.30*sin(clock*.23)+.08*sin(clock*.11))+sin(progress*31.4159)*.28;
 R1=rot(rotation+pointer.x*.09);
 R2=rot((1.-settle)*.21+sin(progress*18.8496)*.16-pointer.y*.06);
 R3=rot((1.-settle)*-.26+sin(progress*25.1327)*.06);
 RQ1=rot(.35+clock*.04);RQ2=rot(.52);
 if(progress<.33){SA=0;SB=1;SM=ease(.13,.25,progress);}
 else if(progress<.50){SA=1;SB=2;SM=ease(.33,.43,progress);}
 else if(progress<.69){SA=2;SB=3;SM=ease(.50,.61,progress);}
 else if(progress<.86){SA=3;SB=4;SM=ease(.69,.79,progress);}
 else{SA=4;SB=0;SM=ease(.86,.98,progress);}
 float breathe=sin(clock*.52)*.025;
 vec3 ro=vec3(0.,.09,4.2);
 vec3 rd=normalize(vec3(uv*1.64,-2.65));
 vec3 center=vec3(.05,-.02+breathe,0.);
 vec3 col=paper;
 float shadow=exp(-dot((uv-vec2(.03,-.46))*vec2(2.2,12.),(uv-vec2(.03,-.46))*vec2(2.2,12.)))*.09;
 float floorFade=smoothstep(-.5,-.41,uv.y);
 col-=vec3(.7,.63,.4)*shadow*floorFade;
 vec2 causticUV=(uv-vec2(.03,-.46))*vec2(1.65,11.);
 float caustic=exp(-dot(causticUV,causticUV))*pow(.5+.5*cos(causticUV.x*13.+clock*.16),5.)*.032;
 col-=caustic*floorFade*vec3(1.,.5,-.08);
 vec3 oc=ro-center;float b=dot(oc,rd);float c=dot(oc,oc)-2.8;float discriminant=b*b-c;
 if(discriminant>0.){
  float t=max(0.,-b-sqrt(discriminant));float limit=-b+sqrt(discriminant);bool hit=false;
  float minD=1e5,tMin=t;
  for(int i=0;i<72;i++){vec3 p=ro+rd*t-center;float d=shape(p);if(d<minD){minD=d;tMin=t;}if(d<.0017){hit=true;break;}t+=max(d,.001);if(t>limit)break;}
  // coverage: 1 on the glass, easing to 0 over about one screen pixel outside the silhouette (analytic edge AA)
  float cover=hit?1.:1.-smoothstep(0.,tMin*.62/resolution.y,minD/.78);
  if(cover>0.){
   if(!hit)t=tMin;
   vec3 p=ro+rd*t-center;vec3 n=normalAt(p);vec3 view=-rd;vec3 refl=reflect(rd,n);vec3 refr=refract(rd,n,.67);
   float nv=max(.06,dot(n,view)); // grazing normals sampled the dark horizon band and left a dotted rim
   float fresnel=.045+.955*pow(1.-nv,4.2);
   float thickness=glassDepth(p,refr);
   vec3 dispersion=vec3(environment(refract(rd,n,.657)).r,environment(refr).g,environment(refract(rd,n,.683)).b);
   vec3 absorption=exp(-vec3(4.6,2.25,.105)*thickness*2.1);
   vec3 transmitted=dispersion*absorption;
   vec3 reflected=environment(refl);
   vec3 light=normalize(vec3(-.5,.85,1.));vec3 halfV=normalize(light+view);
   float spec=pow(max(0.,dot(n,halfV)),85.);
   float edge=pow(1.-nv,1.5);
   vec3 internal=environment(reflect(refr,-n))*vec3(.025,.05,.10)*(1.-fresnel);
   vec3 glass=mix(transmitted,reflected,fresnel*.82+.12)+internal+spec*vec3(.70);
   float band=pow(max(0.,1.-abs(dot(refl,normalize(vec3(-.7,.9,.2)))-.67)),145.);
   glass+=band*.22+edge*vec3(.015,.035,.055);
   glass=mix(glass,paper,clamp((t-4.8)*.025,0.,.12));
   col=mix(col,glass,cover);
  }
 }
 gl_FragColor=vec4(clamp(col,0.,1.),1.);
}`;
function compile(type,source){const shader=gl.createShader(type);gl.shaderSource(shader,source);gl.compileShader(shader);if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS)){gl.deleteShader(shader);throw new Error('Animation shader unavailable')}return shader}
let program,locations;
try{program=gl.createProgram();const vs=compile(gl.VERTEX_SHADER,vertex),fs=compile(gl.FRAGMENT_SHADER,fragment);gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);gl.deleteShader(vs);gl.deleteShader(fs);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error('Animation program unavailable');gl.useProgram(program);const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);const pos=gl.getAttribLocation(program,'position');gl.enableVertexAttribArray(pos);gl.vertexAttribPointer(pos,2,gl.FLOAT,false,0,0);locations={resolution:gl.getUniformLocation(program,'resolution'),progress:gl.getUniformLocation(program,'progress'),clock:gl.getUniformLocation(program,'clock'),pointer:gl.getUniformLocation(program,'pointer'),studioMap:gl.getUniformLocation(program,'studioMap'),studioMix:gl.getUniformLocation(program,'studioMix')};}catch{parent.classList.add('no-webgl');window.SignalFilm=null;return}
let lost=false,quality=1,lastWidth=0,lastHeight=0,mapLoaded=false,mapMix=0,revealed=false;const born=performance.now();const QUALITY=[1,.75,.55];let qualityStep=0;
const reflectionTexture=gl.createTexture();gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,reflectionTexture);
gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,1,1,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array([240,243,250,255]));
gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
gl.uniform1i(locations.studioMap,0);
const studioImage=new Image();studioImage.onload=()=>{if(lost)return;gl.bindTexture(gl.TEXTURE_2D,reflectionTexture);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,studioImage);mapLoaded=true;};studioImage.src='/assets/studio-reflections.webp';
function resize(){const cw=canvas.clientWidth,ch=canvas.clientHeight;const ratio=Math.min(devicePixelRatio||1,1.5);const factor=Math.min(ratio,1400/Math.max(1,cw))*quality;const width=Math.max(1,Math.round(cw*factor)),height=Math.max(1,Math.round(ch*factor));if(width===lastWidth&&height===lastHeight)return;canvas.width=lastWidth=width;canvas.height=lastHeight=height;gl.viewport(0,0,width,height)}
window.SignalFilm={resize,draw(p,time,x,y){if(lost)return;gl.useProgram(program);gl.uniform2f(locations.resolution,canvas.width,canvas.height);gl.uniform1f(locations.progress,p);gl.uniform1f(locations.clock,time);gl.uniform2f(locations.pointer,x,y);if(mapLoaded)mapMix+=(1-mapMix)*.065;gl.uniform1f(locations.studioMix,mapMix);gl.drawArrays(gl.TRIANGLES,0,6);if(!revealed&&(mapLoaded||performance.now()-born>2500)){revealed=true;if(mapLoaded)mapMix=1;parent.classList.add('webgl-ready')}},lowerQuality(){if(qualityStep>=QUALITY.length-1)return false;quality=QUALITY[++qualityStep];resize();return true},disable(){window.SignalFilm.available=false;parent.classList.remove('webgl-ready');parent.classList.add('no-webgl')},available:true};
canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();lost=true;parent.classList.remove('webgl-ready');window.SignalFilm.available=false});
canvas.addEventListener('webglcontextrestored',()=>{parent.classList.remove('webgl-ready')});
resize();
})();
