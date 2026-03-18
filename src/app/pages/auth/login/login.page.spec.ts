import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit { // <--- La clase empieza aquí

  // 👇 ¡ESTO ES LO QUE TE FALTA! 👇
  credentials = {
    email: '',
    password: ''
  };

  constructor(private router: Router) { }

  ngOnInit() {
  }

  login() {
    console.log('Datos a enviar:', this.credentials);
  }

} // <--- La clase termina aquí