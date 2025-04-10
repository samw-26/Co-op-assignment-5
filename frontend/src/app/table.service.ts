import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { CheckConstraint, PrimaryKey, Schema, ServerResponse, table } from './interfaces';

@Injectable({
	providedIn: 'root'
})
export class TableService {
	private readonly apiurl = "http://localhost:5000/api"
    tableName: string = '';
    pKeys: string[] = [];
	constructor(private http: HttpClient) {}


    getTables(): Observable<table[]> {
        return this.http.get<table[]>(`${this.apiurl}/tables`);
    }
	
	fetchTable(): Observable<{ [index: string]: string }[]> {
		return this.http.get<{ [index: string]: string }[]>(`${this.apiurl}/${this.tableName}`);
	}


	getRecord(id: string): Observable<{ [index: string]: string } | null> {
		return this.http.get<{ [index: string]: string }[]>(`${this.apiurl}/${this.tableName}/${id}`, {observe: "response"})
		.pipe(map((res: HttpResponse<{ [index: string]: string }[]>) => res.body ? res.body[0] : null))
	}


	getPks(): Observable<string[]> {
		return this.http.get<PrimaryKey[]>(`${this.apiurl}/${this.tableName}/pk`).pipe(map(pkObjArray => {
            let pks: string[] = [];
            for (let pkObj of pkObjArray) {
                pks.push(pkObj.Column_Name);
            }
            return pks;
        })); 
	}


	getSchema(): Observable<Schema[]> {
		return this.http.get<Schema[]>(`${this.apiurl}/${this.tableName}/schema`);
	}


	getCheckConstraints(): Observable<CheckConstraint[]> {
		return this.http.get<CheckConstraint[]>(`${this.apiurl}/${this.tableName}/ck`);
	}


	updateRecord(id: string, data: { [index: string]: string }): Observable<ServerResponse> {
		return this.http.put<ServerResponse>(`${this.apiurl}/${this.tableName}/${id}`, data);
	}


	insertRecord(record: { [index: string]: string }): Observable<ServerResponse> {
		return this.http.post<ServerResponse>(`${this.apiurl}/${this.tableName}/insert`, record)
	}


	deleteRecord(id: string): Observable<ServerResponse> {
		return this.http.delete<ServerResponse>(`${this.apiurl}/${this.tableName}/${id}`);
	}
}
