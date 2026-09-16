import { Component, signal, OnInit, inject } from '@angular/core';
import { ProductsService } from '../../services/products/products';

@Component({
  selector: 'app-products',
  imports: [],
  templateUrl: './products.html',
  styleUrl: './products.css',
  providers: [ProductsService],
})
export class Products implements OnInit{
  public products: any = signal([]);
  private _productsService = inject(ProductsService);

  ngOnInit(): void {
    this.getProducts();
  }

  private getProducts():void {
    this._productsService.getProducts().subscribe(
      (response) => {
        this.products.set(response);
      }
    )
  }

}
