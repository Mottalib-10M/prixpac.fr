# Température de base estimée par poste : moyenne 2015-2024 du minimum annuel de la moyenne glissante
# sur 3 jours de (TN+TX)/2 (hivers complets juillet->juin). Météo-France, Licence Ouverte 2.0.
import gzip, io, csv, json, sys, urllib.request, statistics, os, datetime
BASE="https://meteofrance.s3.sbg.io.cloud.ovh.net/data/synchro_ftp/BASE/QUOT/"
stations=json.load(open(sys.argv[1])); out_path=sys.argv[2]
keep={s['id'] for v in stations.values() for s in v['stations']}
res=json.load(open(out_path)) if os.path.exists(out_path) else {}
for d in stations:
    if d in res or not stations[d]['stations']: continue
    series={}
    try:
        req=urllib.request.Request(BASE+f"Q_{d}_previous-1950-2024_RR-T-Vent.csv.gz",headers={"User-Agent":"Mozilla/5.0"})
        with urllib.request.urlopen(req,timeout=600) as r:
            rd=csv.reader(io.TextIOWrapper(gzip.GzipFile(fileobj=io.BufferedReader(r)),encoding="utf-8",errors="ignore"),delimiter=";")
            h=next(rd); ix={k:i for i,k in enumerate(h)}
            for row in rd:
                k=row[ix["NUM_POSTE"]]
                if k not in keep: continue
                dd=row[ix["AAAAMMJJ"]]
                if dd<"20140701": continue
                tn,tx=row[ix["TN"]],row[ix["TX"]]
                if not tn or not tx: continue
                series.setdefault(k,{})[dd]=(float(tn)+float(tx))/2
    except Exception as e:
        print(d,"ERR",e,flush=True); continue
    r2={}
    for k,ser in series.items():
        mins=[]
        for y in range(2014,2024):
            day=datetime.date(y,7,1); vals=[]
            while day<datetime.date(y+1,7,1):
                vals.append(ser.get(day.strftime("%Y%m%d"))); day+=datetime.timedelta(days=1)
            if sum(v is None for v in vals)>15: continue
            run=[ (vals[i]+vals[i+1]+vals[i+2])/3 for i in range(len(vals)-2) if None not in vals[i:i+3]]
            if run: mins.append(min(run))
        if len(mins)>=7: r2[k]=round(statistics.mean(mins),1)
    res[d]=r2; json.dump(res,open(out_path,"w")); print(d,len(r2),flush=True)
print("FIN")
