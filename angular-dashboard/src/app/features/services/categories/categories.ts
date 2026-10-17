import { Injectable, inject, signal } from '@angular/core';
import { httpResource, HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CategoriesPagedResponse, Category, CreateCategory, UpdateCategory } from '../../../features/models/categories.model';
import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class CategoriesService {
  private _http = inject(HttpClient);
  private platoformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platoformId);
  public query = signal({page: 1, pageSize: 10});

  categoriesResource = httpResource<CategoriesPagedResponse>(
    () => {
      if (!this.isBrowser) return undefined;
      return `http://localhost:5000/api/categories?page=${this.query().page}&pageSize=${this.query().pageSize}`
    },{
      defaultValue: undefined
    }
  );

  public createCategory(payload: CreateCategory): Observable<string> {
    return this._http.post<string>('http://localhost:5000/api/categories', payload);
  }

  public deleteCategory(param: string): Observable<null> {
    return this._http.delete<null>(`http://localhost:5000/api/categories/${param}`);
  }

  public updateCategory(payload: UpdateCategory): Observable<string> {
    return this._http.put<string>(`http://localhost:5000/api/categories`, payload);
  }
}
