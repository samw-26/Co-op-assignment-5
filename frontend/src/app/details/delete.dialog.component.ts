import { Component, inject, Inject, viewChild } from '@angular/core';
import {MatDialogModule, MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import { MatButton } from '@angular/material/button';
import { AbstractControl, FormControl, FormsModule, NgForm, ValidationErrors, ValidatorFn } from '@angular/forms';
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
	readonly confirmationForm = viewChild.required<NgForm>('confirmationForm');
	confirmValue: string = "";

	onCancel(): void {
		this.dialogRef.close()
	}

	onConfirm(): void {
		if (this.confirmationForm().valid) {
			this.dialogRef.close(true)
		}
	}
}

