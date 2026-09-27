import { Injectable, inject, signal } from '@angular/core';
import { httpResource, HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Category, CreateCategory, UpdateCategory } from '../../models/categories.model';
import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class CategoriesService {
  private _http = inject(HttpClient);
  private platoformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platoformId);
  public query = signal({value: ''});

  categoriesResource = httpResource<Category[]>(
    () => {
      if (!this.isBrowser) return undefined;
      return `http://localhost:5000/api/categories/${this.query().value}`
    },{
      defaultValue: []
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
