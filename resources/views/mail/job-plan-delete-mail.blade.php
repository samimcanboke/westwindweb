
Hi {{$jobPlan->user->name ?? ''}} 
<br/>
Eine Schicht wurde für Sie storniert 
<br/>
Details zur Planung 
<br/>
Start- Ende : {{$jobPlan->start_date ?? ''}} {{$jobPlan->start_time ?? ''}}  - {{$jobPlan->end_date ?? ''}} {{$jobPlan->end_time ?? ''}}
<br/>
Tourname:  {{$jobPlan->tour_name ?? ''}}
<br/>
Zugnummer: {{$jobPlan->zug_nummer ?? ''}}
<br/>
Von : {{$jobPlan->fromStation->short_name ?? ''}}
<br/>
Bis : {{$jobPlan->toStation->short_name ?? ''}}
<br/>
Lok Nummer : {{$jobPlan->locomotive_nummer ?? ''}}
<br/>


