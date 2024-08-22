<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Certificate;
use App\Models\User;

class UserCertificate extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'certificate_id',
        'certificate_date',
        'validity_date',
        'confirmer',
        'creator',
        'is_visible',
        'reminder_day',
        'file',
    ];

    protected $casts = [
        'certificate_date' => 'date',
        'validity_date' => 'date',
    ];

    protected $with = ['certificate'];

    public function certificate()
    {
        return $this->belongsTo(Certificate::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

}
