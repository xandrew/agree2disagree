import { Component, OnInit } from '@angular/core';
import { UsersService } from '../users.service';
import { UserMeta } from '../user-meta';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-disagreer-selector',
  templateUrl: './disagreer-selector.component.html',
  styleUrls: ['./disagreer-selector.component.scss']
})
export class DisagreerSelectorComponent implements OnInit {
  favorites: UserMeta[] = [];
  error = false
  _email = "";

  get email() { return this._email; };
  set email(email: string) {
    console.log("chg");
    this._email = email;
    this.error = false;
  };

  constructor(
    private dialogRef: MatDialogRef<DisagreerSelectorComponent>,
    private usersService: UsersService) { }

  ngOnInit(): void {
    this.usersService.getFavoriteDisagreers().subscribe(favorites => {
      this.favorites = favorites;
    });
  }

  tryAddByEmail() {
    this.usersService.addDisagreer(this.email).subscribe(success => {
      if (success) {
        this.dialogRef.close();
      } else {
        this.error = true;
        console.log("FUCK");
      }
    });
  }

  choose(disagreer: UserMeta) {
    console.log("Chosen", disagreer);
    this.usersService.addDisagreer(disagreer.email).subscribe({});
    this.dialogRef.close();
  }
}
