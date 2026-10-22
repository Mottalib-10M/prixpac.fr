import json,math,urllib.request,sys
deps=json.load(urllib.request.urlopen("https://geo.api.gouv.fr/departements?fields=nom,code,codeRegion,chefLieu"))
regs={r['code']:r['nom'] for r in json.load(urllib.request.urlopen("https://geo.api.gouv.fr/regions"))}
st=json.load(open(sys.argv[1]))
TB=json.load(open(sys.argv[3]))
for k,v in st.items():
  for x in v['stations']: x['t']=TB.get(k,{}).get(x['id'])
H1="01 02 03 05 08 10 14 15 19 21 23 25 27 28 38 39 42 43 45 51 52 54 55 57 58 59 60 61 62 63 67 68 69 70 71 73 74 75 76 77 78 80 87 88 89 90 91 92 93 94 95".split()
H3="06 11 13 2A 2B 30 34 66 83".split()
def dist(a,b,c,d): return math.hypot((a-c)*111,(b-d)*111*math.cos(math.radians(a)))
out=[]
for dp in deps:
  c=dp['code']
  if len(c)==3: continue
  cl=json.load(urllib.request.urlopen(f"https://geo.api.gouv.fr/communes/{dp['chefLieu']}?fields=nom,centre,population"))
  lon,lat=cl['centre']['coordinates']
  out.append({"code":c,"nom":dp['nom'],"region":regs[dp['codeRegion']],"chefLieu":cl['nom'],"lat":lat,"lon":lon,"zone":"H1" if c in H1 else "H3" if c in H3 else "H2","idf":dp['codeRegion']=="11"})
pref={o['code']:(o['lat'],o['lon']) for o in out}
allst=[s for k,v in st.items() if len(k)==2 for s in v['stations']]
for o in out:
  src='20' if o['code'] in ('2A','2B') else o['code']
  sts=st[src]['stations']; o['emprunt']=False
  if src=='20':
    other='2B' if o['code']=='2A' else '2A'
    sts=[s for s in sts if dist(s['lat'],s['lon'],*pref[o['code']])<dist(s['lat'],s['lon'],*pref[other])]
  if not sts:
    sts=sorted(allst,key=lambda s:dist(s['lat'],s['lon'],o['lat'],o['lon']))[:3]; o['emprunt']=True
  sts=sorted(sts,key=lambda s:dist(s['lat'],s['lon'],o['lat'],o['lon']))
  ref=sts[0]
  reft=next((x for x in sts if x['t'] is not None),None)
  o.update(station=ref['nom'].title(),stationAlt=ref['alt'],dju=ref['dju'],dju2025=ref['dju2025'],tbase=reft['t'],tbaseStation=reft['nom'].title(),stationKm=round(dist(ref['lat'],ref['lon'],o['lat'],o['lon']),1))
  o['stations']=[{"n":s['nom'].title(),"a":s['alt'],"d":s['dju'],"t":s['t']} for s in sorted(sts,key=lambda s:s['nom'])]
  del o['lat'],o['lon']
json.dump(out,open(sys.argv[2],'w'),ensure_ascii=False,indent=0)
print(len(out))
for o in out:
  if o['stationKm']>15 or o['dju2025'] is None or o['emprunt']: print('!',o['code'],o['chefLieu'],o['station'],o['stationKm'],o['dju'],o['dju2025'],len(o['stations']))
print('tbase',min(o['tbase'] for o in out),max(o['tbase'] for o in out), sum(1 for o in out for x in o['stations'] if x['t'] is None));print(min(o['dju'] for o in out), max(o['dju'] for o in out), sum(len(o['stations']) for o in out))
