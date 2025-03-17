import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
	providedIn: 'root'
})
export class TableService {
	private apiurl = "http://localhost:5000/api/"
	constructor(private http: HttpClient) {}
	public getTable(table: string):Observable<Object[]> {
		return this.http.get<Object[]>(`${this.apiurl}${table}`);
	}
}
