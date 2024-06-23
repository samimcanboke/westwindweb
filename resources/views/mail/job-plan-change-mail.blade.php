

Hallo {{$jobPlan->user->name}},

<br/>
Es wurde eine Änderung an Ihrem zugewiesenen Job vorgenommen. Details finden Sie unten:
<br/>
<br/>
Start - Enddatum : {{$oldJobPlan->start_date}} - {{$oldJobPlan->end_date}} => {{$jobPlan->start_date}} - {{$jobPlan->end_date}}
<br/>
Tourname : {{$oldJobPlan->tour_name}} => {{$jobPlan->tour_name}}
<br/>
Zugnummer : {{$oldJobPlan->zug_nummer}} => {{$jobPlan->zug_nummer}}
<br/>
Lokomotivnummer : {{$oldJobPlan->locomotive_nummer}} => {{$jobPlan->locomotive_nummer}}
<br/>
Von : {{$oldJobPlan->from}} => {{$jobPlan->from}}
<br/>
Nach : {{$oldJobPlan->to}} => {{$jobPlan->to}}
<br/>
<br/>
Mit freundlichen Grüßen,
<br/>

Bei Fragen oder Problemen wenden Sie sich bitte an den Support.
<br/>
<br/>