import { Component, inject, Inject, viewChild } from '@angular/core';
import {MatDialogModule, MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import { MatButton } from '@angular/material/button';
import { AbstractControl, FormControl, FormsModule, ValidationErrors, ValidatorFn } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
	selector: 'app-details-delete-dialog',
	imports: [
		MatDialogModule, MatButton, MatFormFieldModule,
		MatInputModule, FormsModule, CommonModule],
	templateUrl: './delete.dialog.component.html',
	styleUrl: './delete.dialog.component.scss',
})

export class DeleteDialog {
	readonly id: string = inject<{id: string}>(MAT_DIALOG_DATA)["id"];
	readonly dialogRef = inject(MatDialogRef<DeleteDialog>);
	readonly confirmationForm = viewChild<FormControl>('confirmationForm');
	confirmValue: string = "";

	onCancel(): void {
		this.dialogRef.close()
	}

	onInput(): void {
		console.log("input");
	}

	isMisMatch(): boolean {
		return this.confirmValue !== this.id;
	}
	onConfirm(): void {
		const confirmationForm = this.confirmationForm();
  if (confirmationForm && confirmationForm.valid) {
			console.log(`Confirmed ${this.confirmValue}`);
			this.dialogRef.close(true)
		}
		else {
			console.log("Not confirmed");
		}
	}
}

