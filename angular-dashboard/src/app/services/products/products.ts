import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Products } from '../../models/products.model';

@Injectable({
  providedIn: 'root',
})

export class ProductsService {
  private _http = inject(HttpClient);

  public getProducts(): Observable<Products[]> {
    return this._http.get<Products[]>("http://localhost:5000/api/products");
  }
}
