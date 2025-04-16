import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';

export const appConfig: ApplicationConfig = {
  providers: [
	provideZoneChangeDetection({ eventCoalescing: true }), 
	provideRouter(routes), 
	provideHttpClient(withFetch()),
	provideRouter(routes, withComponentInputBinding()),
]
};
