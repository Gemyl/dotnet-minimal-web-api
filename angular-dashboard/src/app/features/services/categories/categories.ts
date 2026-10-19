import { Injectable, inject, signal } from '@angular/core';
import { httpResource, HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CategoriesPagedResponse, Category, CreateCategory, UpdateCategory } from '../../../features/models/categories.model';
import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../../../environments/environment.development';
import { PagedRequest } from '../../models/products.model';

@Injectable({
  providedIn: 'root',
})
export class CategoriesService {
  private _http = inject(HttpClient);
  private platoformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platoformId);
  public query = signal<PagedRequest>({page: 1, pageSize: 10, all: false, sortBy: 'name', sortDirection: 'asc'});
  private categoriesUrl: string = environment.CATEGORIES_URL;

  categoriesResource = httpResource<CategoriesPagedResponse>(
    () => {
      if (!this.isBrowser) return undefined;
      const query = this.query();
      return `${this.categoriesUrl}?page=${query.page}&pageSize=${query.pageSize}&all=${query.all}&sortBy=${query.sortBy}&sortDirection=${query.sortDirection}`
    },{
      defaultValue: undefined
    }
  );

  public createCategory(payload: CreateCategory): Observable<string> {
    return this._http.post<string>(this.categoriesUrl, payload);
  }

  public deleteCategory(param: string): Observable<null> {
    return this._http.delete<null>(`${this.categoriesUrl}/${param}`);
  }

  public updateCategory(payload: UpdateCategory): Observable<string> {
    return this._http.put<string>(this.categoriesUrl, payload);
  }
}
