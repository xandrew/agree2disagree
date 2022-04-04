import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DisagreerSelectorComponent } from '../disagreer-selector/disagreer-selector.component';
import { UsersService } from '../users.service';

@Component({
  selector: 'app-disagreers-panel',
  templateUrl: './disagreers-panel.component.html',
  styleUrls: ['./disagreers-panel.component.scss']
})
export class DisagreersPanelComponent implements OnInit {
  constructor(
    public usersService: UsersService,
    private dialog: MatDialog) { }

  ngOnInit(): void {
  }

  startAdd() {
    this.usersService.needsLogin$.subscribe(_x => {
      this.dialog.open(DisagreerSelectorComponent, {
        width: '100vw',
        maxWidth: '800px',
        maxHeight: '85vh',
        restoreFocus: false,
        autoFocus: false,
      });

    });
  }

  login() {
    this.usersService.needsLogin$.subscribe({});
  }
}
