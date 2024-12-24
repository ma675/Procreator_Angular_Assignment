import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HomeService {

  constructor(private http: HttpClient) { }


  // for getting all Task details
  public getTaskDetailsList() {
    return this.http.get<any>("http://localhost:8080/data")
      .pipe(map((res: any) => {
        return res;
      }))
  }

  // for get Task details by id
  public getTaskDetailsById(id: any) {
    return this.http.get<any>("http://localhost:8080/data/" + id)
  }

  // for adding Task details
  public addTaskDetails(data: any) {
    return this.http.post<any>("http://localhost:8080/data", data)
      .pipe(map((res: any) => {
        return res;
      }))
  }

  // for update Task detail
  public updateTaskDetails(id: any, data: any) {
    console.log('updateTaskDetails(id: any, data: any)=>', data);

    return this.http.put<any>("http://localhost:8080/data/" + id, data)
      .pipe(map((res: any) => {
        return res;
      }))
  }

  // for delete Task detail
  public deleteTaskDetails(id: any) {
    return this.http.delete<any>("http://localhost:8080/data/" + id)
      .pipe(map((res: any) => {
        return res;
      }))
  }


}
