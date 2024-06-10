<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\ConfirmablePasswordController;
use App\Http\Controllers\Auth\EmailVerificationNotificationController;
use App\Http\Controllers\Auth\EmailVerificationPromptController;
use App\Http\Controllers\Auth\NewPasswordController;
use App\Http\Controllers\Auth\PasswordController;
use App\Http\Controllers\Auth\PasswordResetLinkController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\Auth\VerifyEmailController;
use Illuminate\Support\Facades\Route;
use App\Http\Middleware\IsAdmin;

Route::middleware('guest')->group(function () {
    Route::get('register', [RegisteredUserController::class, 'create'])->withoutMiddleware([IsAdmin::class])
                ->name('register');

    Route::post('register', [RegisteredUserController::class, 'store'])->withoutMiddleware([IsAdmin::class]);

    Route::get('login', [AuthenticatedSessionController::class, 'create'])->withoutMiddleware([IsAdmin::class])
                ->name('login');

    Route::post('login', [AuthenticatedSessionController::class, 'store'])->withoutMiddleware([IsAdmin::class]);

    Route::get('forgot-password', [PasswordResetLinkController::class, 'create'])->withoutMiddleware([IsAdmin::class])
                ->name('password.request');

    Route::post('forgot-password', [PasswordResetLinkController::class, 'store'])->withoutMiddleware([IsAdmin::class])
                ->name('password.email');

    Route::get('reset-password/{token}', [NewPasswordController::class, 'create'])->withoutMiddleware([IsAdmin::class])
                ->name('password.reset');

    Route::post('reset-password', [NewPasswordController::class, 'store'])->withoutMiddleware([IsAdmin::class])
                ->name('password.store');
});

Route::middleware('auth')->group(function () {
    Route::get('verify-email', EmailVerificationPromptController::class)
                ->name('verification.notice')->withoutMiddleware([IsAdmin::class]);

    Route::get('verify-email/{id}/{hash}', VerifyEmailController::class)
                ->middleware(['signed', 'throttle:6,1'])
                ->withoutMiddleware([IsAdmin::class])
                ->name('verification.verify');

    Route::post('email/verification-notification', [EmailVerificationNotificationController::class, 'store'])
                ->middleware('throttle:6,1')
                ->withoutMiddleware([IsAdmin::class])
                ->name('verification.send');

    Route::get('confirm-password', [ConfirmablePasswordController::class, 'show'])
                ->withoutMiddleware([IsAdmin::class])
                ->name('password.confirm');

    Route::post('confirm-password', [ConfirmablePasswordController::class, 'store'])->withoutMiddleware([IsAdmin::class]);

    Route::put('password', [PasswordController::class, 'update'])->name('password.update')->withoutMiddleware([IsAdmin::class]);

    Route::post('logout', [AuthenticatedSessionController::class, 'destroy'])->withoutMiddleware([IsAdmin::class])
                ->name('logout');

    Route::post('registered', [RegisteredUserController::class, 'store_inside'])->name('registered');
    Route::get('show', [RegisteredUserController::class, 'show'])->name('users.show');

});
