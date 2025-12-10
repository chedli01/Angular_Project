import { Component } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup, FormControl } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { UserSignup } from '../../../core/models/user.model';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule,RouterModule],
  templateUrl: './signup.html',
})
export class SignupComponent {
  loading = false;
  form: FormGroup<{
    name: FormControl<string>;
    email: FormControl<string>;
    password: FormControl<string>;
  }>;
  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
   this.form = new FormGroup({
      name: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(3)] }),
      email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
      password: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(6)] }),
    });
  }

  async submit() {
    this.loading = true;
    try {
      const value: UserSignup = this.form.getRawValue();
      await this.authService.signup(value);
      this.router.navigate(['/login']);
    } catch (err) {
      console.error('Signup error:', err);
      alert('Signup failed. Try again.');
    }

    this.loading = false;
  }
}
