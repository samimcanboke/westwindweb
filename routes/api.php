<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\Api\JWTAuthController;
use App\Http\Middleware\JWTAuthentication;

Route::middleware([JWTAuthentication::class])->group(function () {
    Route::get('/user', [RegisteredUserController::class, 'show']);
    Route::post('/user', [RegisteredUserController::class, 'store']);
    Route::put('/user/{id}', [RegisteredUserController::class, 'update']);
    Route::delete('/user/{id}', [RegisteredUserController::class, 'destroy']);
    Route::post('/refresh', [JWTAuthController::class, 'refresh']); 
    Route::post('/logout', [JWTAuthController::class, 'logout']);
});

Route::post('/login', [JWTAuthController::class, 'login'])->withoutMiddleware(JWTAuthentication::class);
Route::post('/verify', [JWTAuthController::class, 'verify'])->withoutMiddleware(JWTAuthentication::class);
