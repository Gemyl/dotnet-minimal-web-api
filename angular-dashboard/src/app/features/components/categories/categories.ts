import { Component, inject, signal, computed } from '@angular/core';
import { form, FormField, minLength, required } from '@angular/forms/signals';
import { CategoriesService } from '../../services/categories/categories';
import { Category } from '../../models/categories.model';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-categories',
  imports: [FormField, MatProgressSpinnerModule],
  providers: [CategoriesService],
  templateUrl: './categories.html',
  styleUrl: './categories.css',
})
export class Categories {
  protected createCategoryModel = signal({name: ''});
  protected editCategoryModel = signal({id: '', name: ''});
  protected createCategoryForm = form(this.createCategoryModel, (f) => {
    required(f.name, {message: 'Each category must have a name'});
    minLength(f.name, 2, {message: 'Category name must be at least 2 characters long'});
  });
  protected editCategoryForm = form(this.editCategoryModel);
  protected _categoriesService = inject(CategoriesService);
  protected hoveredItemIndex = signal(-1);
  protected categories = computed(() => {
    if (this._categoriesService.categoriesResource.hasValue()) {
      return this._categoriesService.categoriesResource.value().items;
    } else {
      return []
    };
  })

  protected onFormSubmit(): void {
    this._categoriesService.createCategory(this.createCategoryModel())
    .subscribe((response: string) => {
      if (response) {
        this._categoriesService.query.update((value) => ({...value}));
      }
    });
  }

  protected deleteCategory(id: string) {
    this._categoriesService.deleteCategory(id).subscribe(() => {
      if (this.categories().length == 1) {
        this._categoriesService.query.update((value) => ({
          ...value,
          ...{page: 1}
        }));        
      } else {
        this._categoriesService.query.update((value) => ({...value}));
      }
    });
  }

  protected selectCategoryForEdit(category: Category) {
    this.editCategoryModel.set(category);
  }

  protected saveChanges() {
    this._categoriesService.updateCategory(this.editCategoryModel())
    .subscribe((response: string) => {
      if (response) {
        this.cancelEdit();
        this._categoriesService.query.update((value) => ({...value}));
      }
    });
  }

  protected cancelEdit() {
    this.editCategoryModel.set({
      id: '',
      name: ''
    });
  }

  onItemHover(index: number) {
    this.hoveredItemIndex.set(index);
  }

  onItemLeave() {
    this.hoveredItemIndex.set(-1);
  }

  onPageChange(page: number): void {
    this._categoriesService.query.update((value) => ({
      ...value,
      ...{ page }
    }));
  }

  onPageSizeChange(event: any): void {
    this._categoriesService.query.update((value) => ({
      ...value,
      ...{ pageSize: Number(event.target.value) }
    }));
  }
}
