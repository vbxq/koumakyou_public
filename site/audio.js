(function(){"use strict";const p=new URLSearchParams(location.search),f=window.AudioContext||window.webkitAudioContext;if(p.has("mute")||!f)return;class k{constructor(s){this.limit=s,this.chunks=[],this.at=0,this.frames=0,this.started=!1,this.underrun=0,this.discarded=0}push(s){this.chunks.push(s),this.frames+=s.length>>1,this.started=!0;let n=Math.max(0,this.frames-this.limit);for(this.frames-=n,this.discarded+=n;n>0;){const o=(this.chunks[0].length>>1)-this.at,r=Math.min(o,n);this.at+=r,n-=r,this.at*2>=this.chunks[0].length&&(this.chunks.shift(),this.at=0)}}read(s,n,o){const r=s.length;let a=0;for(;a<r&&this.chunks.length;){const u=this.chunks[0],A=(u.length>>1)-this.at,l=Math.min(A,r-a);for(let h=0;h<l;h++)s[a+h]=u[(this.at+h)*2],n[a+h]=u[(this.at+h)*2+1];o&&o.push(u.slice(this.at*2,(this.at+l)*2)),this.at+=l,a+=l,this.at*2>=u.length&&(this.chunks.shift(),this.at=0)}return this.frames-=a,a<r&&(s.fill(0,a),n.fill(0,a),this.started&&(this.underrun+=r-a)),a}}const c=p.has("audio-tap");let i;const b={latencyHint:"interactive",sampleRate:Number(p.get("audio-rate")||44100)};try{i=new f(b)}catch{try{i=new f({latencyHint:"interactive"})}catch{return}}const t=window.koumakyouAudio={rate:i.sampleRate,pushed:0,played:0,underrun:0,discarded:0,mode:"none",buffered(){return Math.max(0,t.pushed-t.played-t.discarded)},push(e){i.state==="running"&&(t.pushed+=e.length>>1,c&&d.pushed.push(e.slice()),g(e))},resume(){return i.resume()},suspend(){return i.suspend()},state(){return i.state}},d={pushed:[],played:[]};let m=[];function g(e){t.node?t.node.port.postMessage(e,[e.buffer]):t.queue?t.queue.push(e):m.push(e)}const q="const Queue = "+k.toString()+`;

    registerProcessor("koumakyou-out", class extends AudioWorkletProcessor {
        constructor(options) {
            super();
            this.queue = new Queue(Math.ceil(sampleRate * 0.075));
            this.played = 0; this.quanta = 0; this.tap = options.processorOptions.tap ? [] : null;
            this.port.onmessage = (event) => {
                if (event.data === "flush") { this.report(true); return; }
                this.queue.push(event.data);
            };
        }
        report(flush) {
            const message = { played: this.played, underrun: this.queue.underrun, discarded: this.queue.discarded };
            if (this.tap && this.tap.length) { message.tap = this.tap.splice(0); }
            if (flush) message.flushed = true;
            this.port.postMessage(message);
        }
        process(inputs, outputs) {
            const out = outputs[0];
            this.played += this.queue.read(out[0], out[1] || out[0], this.tap);
            if (++this.quanta % 2 === 0) this.report(false);
            return true;
        }
    });`;function x(e){if(t.played=e.played,t.underrun=e.underrun,t.discarded=e.discarded,e.tap)for(const s of e.tap)d.played.push(s);e.flushed&&t.onFlushed&&t.onFlushed()}async function R(){if(i.audioWorklet&&window.AudioWorkletNode)try{const n=URL.createObjectURL(new Blob([q],{type:"text/javascript"}));await i.audioWorklet.addModule(n),URL.revokeObjectURL(n);const o=new AudioWorkletNode(i,"koumakyou-out",{numberOfInputs:0,outputChannelCount:[2],processorOptions:{tap:c}});o.port.onmessage=r=>x(r.data),o.connect(i.destination),t.node=o,t.mode="worklet";for(const r of m.splice(0))g(r);return}catch(n){console.warn("audio: AudioWorklet unavailable ("+n+"), ScriptProcessor fallback")}const e=t.queue=new k(Math.ceil(i.sampleRate*.075)),s=i.createScriptProcessor(2048,0,2);s.onaudioprocess=n=>{const o=n.outputBuffer;t.played+=e.read(o.getChannelData(0),o.getChannelData(1),c?d.played:null),t.underrun=e.underrun,t.discarded=e.discarded},s.connect(i.destination),t.script=s,t.mode="script";for(const n of m.splice(0))g(n)}function y(){if(i.state==="running")return w();i.resume().then(()=>{i.state==="running"&&w()},()=>{})}const M=["pointerdown","mousedown","touchend","keydown","click"];function w(){for(const e of M)window.removeEventListener(e,y,!0)}for(const e of M)window.addEventListener(e,y,!0);i.resume().then(()=>{i.state==="running"&&w()},()=>{});function v(e){let s=0;for(const r of e)s+=r.length;const n=new Float32Array(s);let o=0;for(const r of e)n.set(r,o),o+=r.length;return n}t.tapReport=async function(){if(!c)return null;t.node&&await new Promise(u=>{t.onFlushed=u,t.node.port.postMessage("flush"),setTimeout(u,2e3)});const e=v(d.pushed),s=v(d.played);let n=0,o=-1;const r=Math.min(e.length,s.length);for(let u=0;u<r;u++)e[u]!==s[u]&&(n++,o<0&&(o=u));let a=0;for(let u=0;u<s.length;u++)a=Math.max(a,Math.abs(s[u]));return{mode:t.mode,state:i.state,rate:t.rate,pushedFrames:e.length>>1,playedFrames:s.length>>1,underrunFrames:t.underrun,differingSamples:n,firstDifference:o,discardedFrames:t.discarded,peak:a,played:s,pushed:e}},R().catch(e=>console.warn("audio: "+e))})();
