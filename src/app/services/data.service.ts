import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { SessionService } from './session.service';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  constructor(private http: HttpClient) { }
  getAllData(url: string, headers?: HttpHeaders): Observable<any[]> {
    return this.http.get<any[]>(environment.apiDomain + url,{headers: headers? headers: new HttpHeaders});
  }

  getFileData(url: string, headers?: HttpHeaders): Observable<any>{
    return this.http.get(url,{
      responseType: 'blob',
      headers: headers? headers: new HttpHeaders
    });
  }

  getOneData(url: string, headers?: HttpHeaders): Observable<any> {
    return this.http.get<any>(environment.apiDomain + url,{headers: headers? headers: new HttpHeaders});
  }

  httpPostMethod(url: string, data: any, headers?: HttpHeaders) {
    return this.http.post<any>(environment.apiDomain + url, data,{headers: headers? headers: new HttpHeaders});
  }

  httpPutMethod(url: string, id: string, data: any, headers?: HttpHeaders) {
    return this.http.put(environment.apiDomain + url + '/' + id, data,{headers: headers? headers: new HttpHeaders});
  }

  httpDeleteMethod(url: string, id: string, headers?: HttpHeaders) {
    return this.http.delete(environment.apiDomain + url + '/' + id,{headers: headers? headers: new HttpHeaders});
  }
}
