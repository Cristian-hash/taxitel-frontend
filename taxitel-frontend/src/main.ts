import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app'; // Importamos el nombre correcto

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));