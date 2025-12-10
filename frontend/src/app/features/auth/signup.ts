import { Component } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { NgIf } from '@angular/common'; // <-- import NgIf

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf], // <-- include NgIf here
  templateUrl: './signup.html'
})
export class SignupComponent {

  loading = false;
  form : FormGroup

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });
  }

  

  async submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;

    try {
      await this.auth.signup(this.form.value as any); // we'll fix type after
      this.router.navigate(['/login']);  // redirect
    } catch (err) {
      console.error('Signup error:', err);
      alert('Signup failed. Try again.');
    }

    this.loading = false;
  }
}
