(function(root){
function calculate(data,scores={},whatif=false){
 const teams=data.teams.map(t=>({...t})),map=Object.fromEntries(teams.map(t=>[t.id,t]));
 const games=data.fixtures.map(f=>({...f,...((f.hg===null||whatif)&&scores[f.id]?{hg:scores[f.id][0],ag:scores[f.id][1]}:{})}));
 function apply(f,a,b,sign){const h=map[f.home],w=map[f.away];h.pj+=sign;w.pj+=sign;h.gf+=a*sign;h.gc+=b*sign;w.gf+=b*sign;w.gc+=a*sign;w.awayGF+=b*sign;if(a===b){h.pe+=sign;w.pe+=sign;h.pts+=sign;w.pts+=sign}else{const win=a>b?h:w,lose=a>b?w:h;win.pg+=sign;lose.pp+=sign;win.pts+=3*sign}}
 for(const f of data.fixtures){const v=scores[f.id];if((f.hg!==null&&!whatif)||!v||v.length!==2||!v.every(x=>Number.isInteger(x)&&x>=0&&x<=99))continue;if(f.hg!==null)apply(f,f.hg,f.ag,-1);apply(f,v[0],v[1],1)}

 teams.sort((a,b)=>b.pts-a.pts||(b.gf-b.gc)-(a.gf-a.gc)||b.gf-a.gf);
 const groups=[];for(const t of teams){const key=[t.pts,t.gf-t.gc,t.gf].join('/');let g=groups.at(-1);if(!g||g.key!==key)groups.push(g={key,items:[]});g.items.push(t)}
 const result=[];for(const g of groups){let end=0;if(g.items.length>1){for(let r=1;r<=17;r++){let counts=g.items.map(t=>games.filter(f=>f.round<=r&&f.away===t.id&&f.hg!==null).length);if(counts.every(n=>n===counts[0]))end=r}for(const t of g.items)t.tieAway=games.filter(f=>f.round<=end&&f.away===t.id&&f.hg!==null).reduce((n,f)=>n+f.ag,0);g.items.sort((a,b)=>b.tieAway-a.tieAway||a.rank-b.rank)}
 for(let i=0;i<g.items.length;){let j=i+1;while(j<g.items.length&&g.items[j].tieAway===g.items[i].tieAway)j++;const lo=result.length+1,hi=lo+j-i-1;for(let k=i;k<j;k++)result.push({...g.items[k],position:lo,positionMax:hi});i=j}}
 return result;
}
root.calculate=calculate;if(typeof module!=='undefined')module.exports={calculate};
})(typeof window!=='undefined'?window:globalThis);
