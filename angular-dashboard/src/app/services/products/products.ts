import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateProduct, Product } from '../../models/products.model';
import { httpResource } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})

export class ProductsService {
  private _http = inject(HttpClient);
  public query = signal({value: ''});
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);


  productsResource = httpResource<Product[]>(() => {
    if (!this.isBrowser) return undefined;
    return `http://localhost:5000/api/products/${this.query().value}`
  }, {
    defaultValue: []
  });

  public createProduct(payload: CreateProduct): Observable<Product> {
    return this._http.post<Product>("http://localhost:5000/api/products", payload);
  }

  public deleteProduct(param: string): Observable<number> {
    return this._http.delete<number>(`http://localhost:5000/api/products/${param}`);
  }

  public updateProduct(payload: Product): Observable<Product> {
    return this._http.put<Product>(`http://localhost:5000/api/products`, payload);
  }

}
