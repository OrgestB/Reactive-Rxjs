import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { User } from "../model/user";
import { map } from "rxjs/internal/operators/map";
import { HttpClient } from "@angular/common/http";
import { shareReplay, tap } from "rxjs/operators";

const AUTH_DATA = "auth_data";

@Injectable({
    providedIn: "root"
})


export class AuthStore {

    private subject = new BehaviorSubject<User>(null);

    user$: Observable<User> = this.subject.asObservable();
    isLoggedIn$: Observable<boolean>;
    isLoggedOut: Observable<boolean>;

    constructor(
        private http: HttpClient
    ){
        this.isLoggedIn$ = this.user$.pipe(map(user => !!user)); //true or false if user exists
        this.isLoggedOut = this.isLoggedIn$.pipe(map(isLoggedIn => !isLoggedIn));
        const user = localStorage.getItem(AUTH_DATA); 
        if (user) {
            this.subject.next(JSON.parse(user));
        }
    }


    login(email: string, password: string) :Observable<User> {
        return this.http.post<User>("/api/login", {email, password})
            .pipe(
                tap(user=> {
                    this.subject.next(user);
                    localStorage.setItem(AUTH_DATA, JSON.stringify(user));
                }),
                shareReplay()
            );
    }

    logout(){
        this.subject.next(null);
        localStorage.removeItem(AUTH_DATA);
    }
 }