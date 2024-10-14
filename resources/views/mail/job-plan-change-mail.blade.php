

Hallo {{$jobPlan->user->name}},

<br/>
Es wurde eine Änderung an Ihrem zugewiesenen Job vorgenommen. Details finden Sie unten:
<br/>
<br/>
Start - Enddatum :  {{$jobPlan->start_date}} - {{$jobPlan->end_date}}
<br/>
Tourname : {{$jobPlan->tour_name}}
<br/>
Zugnummer :  {{$jobPlan->zug_nummer}}
<br/>
Lokomotivnummer : {{$jobPlan->locomotive_nummer}}
<br/>
Von : {{$jobPlan->fromStation->short_name}}
<br/>
Nach : {{$jobPlan->toStation->short_name}}
<br/>
<br/>
Mit freundlichen Grüßen,
<br/>

Bei Fragen oder Problemen wenden Sie sich bitte an den Support.
<br/>
<br/>