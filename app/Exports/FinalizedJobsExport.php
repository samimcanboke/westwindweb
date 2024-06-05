<?php

namespace App\Exports;

use App\Models\FinalizedJobs;
use Maatwebsite\Excel\Excel;
use Maatwebsite\Excel\Concerns\WithDrawings;
//use Maatwebsite\Excel\Facades\Excel;
use Maatwebsite\Excel\Concerns\Exportable;
use PhpOffice\PhpSpreadsheet\Worksheet\Drawing;


class FinalizedJobsExport implements  WithDrawings
{

    public function drawings()
    {
        $drawing = new Drawing();
        $drawing->setName('Logo');
        $drawing->setDescription('WestWindLogo');
        $drawing->setPath(public_path('/indir.png'));
        $drawing->setHeight(50);
        $drawing->setCoordinates('B3');

        

       
   
    }
}
