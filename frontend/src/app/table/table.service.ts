import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { CheckConstraint, PrimaryKey, Schema } from '../interfaces';

@Injectable({
	providedIn: 'root'
})
export class TableService {
	private readonly apiurl = "http://localhost:5000/api"
	constructor(private http: HttpClient) {}

	
	fetchTable(table: string): Observable<{ [index: string]: string }[]> {
		return this.http.get<{ [index: string]: string }[]>(`${this.apiurl}/${table}`);
	}


	getRecord(table: string, id: string): Observable<{ [index: string]: string } | null> {
		return this.http.get<{ [index: string]: string }[]>(`${this.apiurl}/${table}/${id}`, {observe: "response"})
		.pipe(map((res: HttpResponse<{ [index: string]: string }[]>) => res.body ? res.body[0] : null))
	}


	getPkName(table: string): Observable<PrimaryKey> {
		return this.http.get<PrimaryKey[]>(`${this.apiurl}/${table}/pk`).pipe(map(obj => obj[0]))
	}


	getSchema(table: string): Observable<Schema[]> {
		return this.http.get<Schema[]>(`${this.apiurl}/${table}/schema`);
	}


	getCheckConstraints(table: string): Observable<CheckConstraint[]> {
		return this.http.get<CheckConstraint[]>(`${this.apiurl}/${table}/ck`);
	}


	deleteRecord(table: string, id: string): Observable<Object> {
		return this.http.delete(`${this.apiurl}/${table}/${id}`, {responseType: "text"});
	}
}
