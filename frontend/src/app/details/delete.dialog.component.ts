import { Component, inject, Inject, viewChild } from '@angular/core';
import {MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import { MatButton } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
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
	readonly dialogRef = inject(MatDialogRef<DeleteDialog>);
	onCancel(): void {
		this.dialogRef.close()
	}

	onConfirm(): void {
        this.dialogRef.close(true);
	}
}

