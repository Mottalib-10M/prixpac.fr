# Calcule les DJU (base 18 °C, méthode (TN+TX)/2) par poste puis par département, Météo-France open data (Licence Ouverte 2.0)
import gzip, io, csv, json, sys, urllib.request, statistics, os
BASE="https://meteofrance.s3.sbg.io.cloud.ovh.net/data/synchro_ftp/BASE/QUOT/"
out_path=sys.argv[1]
depts=[f"{i:02d}" for i in range(1,96) if i!=20]+["20","971","972","973","974","976"]
res=json.load(open(out_path)) if os.path.exists(out_path) else {}
def process(url, years):
    st={}
    req=urllib.request.Request(url,headers={"User-Agent":"Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=600) as r:
        g=gzip.GzipFile(fileobj=io.BufferedReader(r))
        rd=csv.reader(io.TextIOWrapper(g,encoding="utf-8",errors="ignore"),delimiter=";")
        h=next(rd); ix={k:i for i,k in enumerate(h)}
        for row in rd:
            d=row[ix["AAAAMMJJ"]]; y=int(d[:4])
            if y not in years: continue
            tn,tx=row[ix["TN"]],row[ix["TX"]]
            if not tn or not tx: continue
            m=(float(tn)+float(tx))/2
            k=row[ix["NUM_POSTE"]]
            s=st.setdefault(k,{"nom":row[ix["NOM_USUEL"]],"alt":int(float(row[ix["ALTI"]] or 0)),"lat":float(row[ix["LAT"]]),"lon":float(row[ix["LON"]]),"y":{}})
            yy=s["y"].setdefault(y,[0,0.0]); yy[0]+=1; yy[1]+=max(0.0,18-m)
    return st
for d in depts:
    if d in res: continue
    try:
        hist=process(BASE+f"Q_{d}_previous-1950-2024_RR-T-Vent.csv.gz", set(range(2015,2025)))
        last=process(BASE+f"Q_{d}_latest-2025-2026_RR-T-Vent.csv.gz", {2025})
    except Exception as e:
        print(d,"ERR",e,flush=True); continue
    stations=[]
    for k,s in hist.items():
        full=[v[1] for y,v in s["y"].items() if v[0]>=350]
        if len(full)>=8:
            l=last.get(k,{}).get("y",{}).get(2025)
            stations.append({"id":k,"nom":s["nom"],"alt":s["alt"],"lat":s["lat"],"lon":s["lon"],"dju":round(statistics.mean(full)),"n":len(full),"dju2025":round(l[1]) if l and l[0]>=350 else None})
    res[d]={"stations":stations}
    json.dump(res,open(out_path,"w"),ensure_ascii=False)
    print(d,len(stations),flush=True)
print("FIN")
