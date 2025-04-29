<?php

namespace App\Services;

use App\Models\User;
use App\Models\UserSalary;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class SalaryService
{
    public function updateSalary(User $user, float $newSalary, string $effectiveDate): void
    {
        DB::transaction(function () use ($user, $newSalary, $effectiveDate) {
            $effectiveDate = Carbon::parse($effectiveDate);

            $currentSalary = $user->salaries()
                ->whereNull('valid_to')
                ->first();

            if ($currentSalary) {
                $currentSalary->update([
                    'valid_to' => $effectiveDate->copy()->subDay(),
                ]);
            }

            $user->salaries()->create([
                'salary' => $newSalary,
                'valid_from' => $effectiveDate,
                'valid_to' => null,
            ]);
        });
    }

    public function getSalaryAtDate(User $user, string $date): ?UserSalary
    {
        $date = Carbon::parse($date);

        return $user->salaries()
            ->where('valid_from', '<=', $date)
            ->where(function($query) use ($date) {
                $query->whereNull('valid_to')
                      ->orWhere('valid_to', '>=', $date);
            })
            ->orderBy('valid_from', 'desc')
            ->first();
    }
}