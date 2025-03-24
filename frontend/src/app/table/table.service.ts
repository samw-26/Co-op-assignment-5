import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';

@Injectable({
	providedIn: 'root'
})
export class TableService {
	private apiurl = "http://localhost:5000/api"
	constructor(private http: HttpClient) {}

	public fetchTable(table: string): Observable<{ [index: string]: string }[]> {
		return this.http.get<{ [index: string]: string }[]>(`${this.apiurl}/${table}`);
	}

	public getRecord(table: string, id: string): Observable<{ [index: string]: string }> {
		return this.http.get<{ [index: string]: string }[]>(`${this.apiurl}/${table}/${id}`).pipe(map(obj => obj[0]))
	}

}
