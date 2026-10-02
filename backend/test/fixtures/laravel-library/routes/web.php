<?php
use Illuminate\Support\Facades\Route;
Route::get('/login', [App\Http\Controllers\AuthController::class, 'show']);
Route::post('/login', [App\Http\Controllers\AuthController::class, 'login']);
Route::get('/books', [App\Http\Controllers\BookController::class, 'index']);
Route::post('/books', [App\Http\Controllers\BookController::class, 'store']);
Route::get('/members', [App\Http\Controllers\MemberController::class, 'index']);
Route::post('/issues', [App\Http\Controllers\IssueController::class, 'store']);
