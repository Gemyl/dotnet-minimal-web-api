import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { form, FormField, min, minLength, required } from '@angular/forms/signals';
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
export class Categories implements OnInit {
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
      return this._categoriesService.categoriesResource.value();
    } else {
      return []
    };
  })

  ngOnInit(): void {
    this.GetAllCategories();
  }

  protected GetAllCategories(): void {
    this._categoriesService.query.set({value: ''});
  }

  protected onFormSubmit(): void {
    this._categoriesService.createCategory(this.createCategoryModel())
    .subscribe((response: string) => {
      if (response) {
        console.log(`Category with ID ${response} created.`);
        this._categoriesService.query.set({value: ''});
      }
    });
  }

  protected deleteCategory(id: string) {
    this._categoriesService.deleteCategory(id).subscribe((response) => {
      console.log(`Product with ID ${response} successfully deleted`);
      this._categoriesService.query.set({value: ''});
    });
  }

  protected selectCategoryForEdit(category: Category) {
    this.editCategoryModel.set(category);
  }

  protected saveChanges() {
    this._categoriesService.updateCategory(this.editCategoryModel())
    .subscribe((response: string) => {
      console.log(response);
      this.cancelEdit();
      this._categoriesService.query.set({value: ''});
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
}
