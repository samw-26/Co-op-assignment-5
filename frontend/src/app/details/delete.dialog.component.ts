import { Component, inject, Inject } from '@angular/core';
import {MatDialogModule, MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import { MatButton } from '@angular/material/button';
import { FormControl, FormsModule } from '@angular/forms';
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
	confirmValue: string = "";
	disabled: boolean = true;

	onCancel(): void {
		this.dialogRef.close()
	}

	onInput(): void {
		if (this.isMatch()) {
			this.disabled = false;
		}
		else {
			this.disabled = true;
		}
	}

	isMatch(): boolean {
		return this.confirmValue === this.id
	}

	onConfirm(): void {
		console.log("confirmed", this.confirmValue);
	}
}

