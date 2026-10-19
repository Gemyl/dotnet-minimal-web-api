import { Component, signal, inject, computed } from '@angular/core';
import { ProductsService } from '../../services/products/products';
import { CreateProduct, Product } from '../../models/products.model';
import { form, FormField, required } from '@angular/forms/signals';
import { CategoriesService } from '../../services/categories/categories';
import { Category } from '../../models/categories.model';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-products',
  imports: [FormField, MatProgressSpinnerModule],
  templateUrl: './products.html',
  providers: [ProductsService],
})
export class Products {
  public createProductModel = signal<CreateProduct>({
    name: '',
    price: null,
    categoryId: '',
  });
  public editProductModel = signal<Product>({
    id: '',
    name: '',
    price: null,
    categoryId: '',
  });
  public createProductForm = form(this.createProductModel, (f) => {
    required(f.name);
    required(f.price);
    required(f.categoryId);
  });
  protected editProductForm = form(this.editProductModel);
  protected _productsService = inject(ProductsService);
  protected _categoriesService = inject(CategoriesService);
  protected hoveredItemIndex = signal(-1);
  protected products = computed(() => {
    if (this._productsService.productsResource.hasValue()) {
      let products: any = [];

      this._productsService.productsResource.value().items.forEach((product: Product) => {
        product = {
          ...product,
          ...{
            categoryName: this._categoriesService.categoriesResource.value()?.items
            ?.find((category: Category) => category.id == product.categoryId)
            ?.name
          }
        };

        products.push(product);
      })

      return products;
    } else {
      return []
    };
  })

  constructor() {
    this._categoriesService.query.update((value) => ({
      ...value,
      ...{
        all: true
      }
    }));
  }

  public onFormSubmit() {
    this._productsService.createProduct(this.createProductModel()).subscribe((response) => {
      if (response.id) {
        this._productsService.query.update((value) => ({...value}));
      }
    });
  }

  protected deleteProduct(id: string) {
    this._productsService.deleteProduct(id).subscribe(() => {
      if (this.products().length == 1) {
        this._productsService.query.update((value) => ({
          ...value,
          ...{ page: 1 }
        }));
      } else {
        this._productsService.query.update((value) => ({...value}));
      }
    });
  }

  protected selectProductForEdit(product: Product) {
    this.editProductModel.set(product);
  }

  protected saveChanges() {
    this._productsService.updateProduct(this.editProductModel()).subscribe((response: Product) => {
      this.cancelEdit();
      this._productsService.query.update((value) => ({...value}));
    });
  }

  protected cancelEdit() {
    this.editProductModel.set({
      id: '',
      name: '',
      price: null,
      categoryId: '',
    });
  }

  onItemHover(index: number) {
    this.hoveredItemIndex.set(index);
  }

  onItemLeave() {
    this.hoveredItemIndex.set(-1);
  }

  onPageChange(page: number): void {
    this._productsService.query.update((value) => ({
      ...value,
      ...{
        page: page
      }
    }));
  }

  onPageSizeChange(event: any): void {
    this._productsService.query.update((value) => ({
      ...value,
      ...{
        pageSize: Number(event.target.value)
      }
    }));
  }

  onSortChange(sortBy: 'name' | 'price' | 'category'): void {
    this._productsService.query.update((query) => ({
      ...query,
      page: 1,
      sortDirection: query.sortBy === sortBy && query.sortDirection === 'asc' ? 'desc' : 'asc',
      sortBy
    }));
  }

}
