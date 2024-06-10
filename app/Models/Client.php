<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\DraftJobs;
use App\Models\FinalizedJobs;

class Client extends Model
{
    use HasFactory;

    public function draftJobs()
    {
        return $this->hasMany(DraftJobs::class);
    }

    public function finalizedJobs()
    {
        return $this->hasMany(FinalizedJobs::class);
    }
}
