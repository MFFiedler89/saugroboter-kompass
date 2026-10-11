const yes = k => p => p.specs[k] === true;
const eq = (k,v) => p => p.specs[k] === v;
const min = (k,n) => p => typeof p.specs[k] === 'number' && p.specs[k] >= n;
const and = (...rules) => p => rules.every(r => r(p));
const rule = (sub,label,match,reason,price=false) => ({sub,label,match,reason:typeof reason === 'function' ? reason : () => reason,price});
const config = (note,...rules) => ({note,rules});
export const situations = {
 'altbau-mit-tuerschwellen':config('Miss Höhe und Form deiner Schwellen. Die genannte Überwindung stammt aus Produktangaben und ist keine Garantie für jede Kante; bei fehlender Angabe vor dem Kauf nachfragen.',
  rule('saugroboter-mit-absaugstation','Mit Schwellenangabe',min('schwelle',0.5),p=>`Laut Produktangaben Hindernisse bis ${p.specs.schwelle} cm. Vergleiche diesen Wert mit deiner höchsten Türschwelle.`),
  rule('saugroboter-mit-absaugstation','Karte für verwinkelte Räume',eq('navigation','LiDAR'),'LiDAR-Navigation ist angegeben und erleichtert die Raumplanung. Die Eignung für deine Türschwellen muss zusätzlich geprüft werden.')),
 'haushalt-mit-tieren':config('Anti-Tangle kann das Verwickeln von Haaren reduzieren. Tierkot und nasse Verschmutzungen vorher entfernen; eine sichere Erkennung ist damit nicht belegt.',
  rule('saugroboter-mit-absaugstation','Für Haare und weniger Entleeren',and(yes('anti_tangle'),p=>typeof p.specs.station==='string'),'Anti-Tangle und eine Station sind angegeben: weniger Haarverwicklung und Unterstützung beim Entleeren.'),
  rule('saugroboter-ab-20000-pa','Anti-Tangle-Bürste',yes('anti_tangle'),'Anti-Tangle ist in den Produktangaben genannt. Bürste und Behälter trotzdem regelmäßig kontrollieren.')),
 'allergie-im-haushalt':config('Diese Auswahl belegt keine Eignung für Allergiker. Filterklasse, Gehäusedichtigkeit und geschlossene Beutelentnahme bitte für das genaue Modell beim Hersteller prüfen.',
  rule('saugroboter-mit-absaugstation','Automatisches Entleeren',p=>typeof p.specs.station==='string','Eine Station zur Staubentleerung ist angegeben. Das allein belegt weder HEPA-Filterklasse noch staubfreie Beutelentnahme.')),
 'grosse-wohnflaeche':config('Hersteller-Laufzeiten hängen vom Modus ab. Wiederaufnahme nach dem Laden und nutzbare Fläche separat prüfen.',
  rule('saugroboter-mit-absaugstation','Laufzeit ab 150 Minuten',min('laufzeit',150),p=>`Bis zu ${p.specs.laufzeit} Minuten laut Produktangaben. Eine Orientierung für längere Reinigungsdurchgänge.`),
  rule('saug-wisch-roboter-mit-station','Automatische Mopp-Pflege',eq('station','Komplettstation'),'Komplettstation mit Mopp-Pflege ist angegeben. Wasser- und Behälterkapazitäten mit deiner Fläche abgleichen.')),
 'hochflorteppich':config('Hohe Pascal-Werte garantieren keine Hochflor-Eignung. Zulässige Florhöhe, Bürste, Teppichkante und Verhalten beim Wischen vor dem Kauf prüfen.',
  rule('saugroboter-ab-20000-pa','Mit Teppicherkennung',and(min('saugkraft',20000),yes('teppich')),p=>`${p.specs.saugkraft} Pa und Teppicherkennung sind angegeben. Ein Kandidat zur Prüfung, kein Nachweis für deinen Hochflorteppich.`)),
 'haushalt-mit-kleinkind':config('Spielzeug, Schnüre und kleine Gegenstände vorher wegräumen. LiDAR belegt keine Erkennung kleiner Hindernisse; Reinigung außerhalb der Schlafzeiten planen.',
  rule('saugroboter-mit-absaugstation','Planbare Räume',eq('navigation','LiDAR'),'LiDAR-Navigation ist angegeben. Räume lassen sich damit gezielter planen; Kleinteile müssen trotzdem weggeräumt werden.'),
  rule('saugroboter-mit-wischfunktion','Für Saugen und Wischen',p=>['Rotierende Mopps','Mopprolle'].includes(p.specs.wischsystem),p=>`${p.specs.wischsystem} sind angegeben. Für geeignete, freie Hartbodenflächen nach den Mahlzeiten.`)),
 'kleine-wohnung':config('Stellfläche der Station, Tankentnahme und Möbelabstände selbst messen. Eine belegte Roboterhöhe sagt nichts über die Größe der Station aus.',
  rule('saugroboter-mit-absaugstation','Mit belegter Bauhöhe',p=>typeof p.specs.bauhoehe==='number'&&p.specs.bauhoehe<=10,p=>`Bauhöhe laut Produktangaben: ${p.specs.bauhoehe} cm. Mit der freien Höhe unter Sofa und Bett abgleichen.`),
  rule('saugroboter-ohne-app','Bedienung ohne App',()=>true,'Aus der belegten Auswahl ohne App und WLAN. Die Ladestation braucht trotzdem einen passenden Stellplatz.')),
 'flur-und-eingangsbereich':config('Nasse Schuhe, Streusalz und groben Schmutz nicht einfach vom Roboter verteilen lassen. Mattenhöhe und Schwellen separat prüfen.',
  rule('saugroboter-mit-absaugstation','Für häufiges Entleeren',p=>typeof p.specs.station==='string','Eine Entleerungsstation ist angegeben. Praktisch bei häufigen Durchgängen im schmutzbelasteten Eingangsbereich.'),
  rule('saugroboter-mit-wischfunktion','Für geeignete Hartböden',p=>['Rotierende Mopps','Mopprolle'].includes(p.specs.wischsystem),p=>`${p.specs.wischsystem} sind angegeben. Bodenfreigabe und Umgang mit Streusalz prüfen.`)),
 'mehrere-etagen':config('Kein Roboter fährt Treppen hinauf. Mehrere speicherbare Karten, Gewicht und Nutzung ohne Station auf einer anderen Etage beim Hersteller prüfen.',
  rule('saugroboter-mit-absaugstation','Kartierende Navigation',eq('navigation','LiDAR'),'LiDAR-Navigation ist angegeben. Mehrere speicherbare Etagenkarten sind damit noch nicht belegt und müssen zusätzlich geprüft werden.')),
 'parkett-und-laminat':config('Die Freigabe deines Bodenherstellers hat Vorrang. Wischsystem allein belegt keine geregelte Wassermenge oder Eignung für unversiegeltes Holz.',
  rule('saugroboter-ohne-wischfunktion','Trocken reinigen',eq('wischsystem','Ohne Wischfunktion'),'Ohne Wischfunktion laut Produktangaben: eine Möglichkeit, empfindliche Flächen ohne zusätzliches Wischwasser zu reinigen.'),
  rule('saugroboter-mit-wischfunktion','Teppiche beim Wischen beachten',yes('teppich'),'Teppicherkennung ist angegeben. Wasserdosierung, No-Mop-Zonen und Bodenfreigabe zusätzlich prüfen.')),
 'erstes-mal-saugroboter':config('Vor dem Kauf Bodenart, Möbelhöhe, Schwellen und Platz für die Station prüfen. Die Auswahl zeigt verschiedene Ausstattungswege, keine universellen Testsieger.',
  rule('saugroboter-mit-absaugstation','Weniger selbst entleeren',p=>typeof p.specs.station==='string','Eine Entleerungsstation ist angegeben. Sinnvoll, wenn du das manuelle Entleeren reduzieren möchtest.'),
  rule('saugroboter-mit-wischfunktion','Auch Hartboden wischen',p=>['Rotierende Mopps','Mopprolle','Wischpad'].includes(p.specs.wischsystem),p=>`${p.specs.wischsystem} laut Produktangaben. Für freigegebene Böden; Pflegeaufwand mit einplanen.`)),
 'fliesen-und-fugen':config('Ein Wischsystem garantiert keine Tiefenreinigung der Fugen. Verschmutzung, Bodenfreigabe und benötigte Mopp-Pflege berücksichtigen.',
  rule('wischroboter-mit-mopprolle','Mit Mopprolle',eq('wischsystem','Mopprolle'),'Eine Mopprolle ist angegeben. Eine Option für feuchte Reinigung freigegebener Fliesenflächen.'),
  rule('saugroboter-mit-wischfunktion','Mit rotierenden Mopps',eq('wischsystem','Rotierende Mopps'),'Rotierende Mopps sind angegeben. Eine Alternative für freigegebene Hartbodenflächen.')),
 'buero-und-homeoffice':config('Kabel und Stuhlrollen bleiben Hindernisse. Ruhezeiten planen; LiDAR allein belegt weder Kameraverzicht noch eine bestimmte Lautstärke.',
  rule('saugroboter-ohne-kamera','Ohne Kamera',()=>true,'Aus der Auswahl mit ausdrücklich belegtem Kameraverzicht. Cloud- und App-Nutzung gesondert prüfen.'),
  rule('saugroboter-mit-absaugstation','Mit kartierender Navigation',eq('navigation','LiDAR'),'LiDAR-Navigation ist angegeben. Das unterstützt planbare Raumreinigung; Kabel vorher wegräumen.')),
};
