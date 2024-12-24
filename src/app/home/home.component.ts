import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { HomeService } from './home.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { taskDetailsModel } from '../taskmodal';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  taskData: any;

  displayedColumns: string[] = ['index', 'title', 'description', 'priority', 'status', 'action'];

  dataSource: MatTableDataSource<any> = new MatTableDataSource();
  @ViewChild(MatPaginator) paginatorUser !: MatPaginator;
  @ViewChild(MatSort) sort !: MatSort;

  @ViewChild('addTaskDialog') addTaskDialog!: TemplateRef<any>;
  @ViewChild('updateTaskDialog') updateTaskDialog!: TemplateRef<any>;
  @ViewChild('deleteTaskDialog') deleteTaskDialog!: TemplateRef<any>;

  taskDetailsModelObj: taskDetailsModel = new taskDetailsModel();



  addTaskForm !: FormGroup;
  updateTaskForm !: FormGroup;

  dialogRef!: MatDialogRef<any>;

  editId: any;
  deleteId: any;
  taskTitle: any;

  selectedStatus: string = '';
  statusOptions = [
    // { value: '', label: 'All' },
    { value: '1', label: 'Pending' },
    { value: '2', label: 'In Progress' },
    { value: '3', label: 'Completed' },
  ];


  constructor(
    private service: HomeService,
    private formbuilder: FormBuilder,
    public dialog: MatDialog,
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.getTaskList();
    this.taskFormBuilders();
  }

  // formBuilders
  public taskFormBuilders() {
    this.addTaskForm = this.formbuilder.group({
      title: ['', Validators.required],
      description: [''],
      priority: [''],
      status: ['']
    })

    this.updateTaskForm = this.formbuilder.group({
      title: ['', Validators.required],
      description: [''],
      priority: [''],
      status: ['']
    })
  }


  public addTaskHasError = (controlName: string, errorName: string) => {
    return this.addTaskForm.controls[controlName]?.hasError(errorName);
  }
  get addTaskHasErrorData() { return this.addTaskForm.controls; }


  public updateTaskHasError = (controlName: string, errorName: string) => {
    return this.updateTaskForm.controls[controlName]?.hasError(errorName);
  }
  get updateTaskHasErrorData() { return this.updateTaskForm.controls; }


  // Filter by Status
  public onFilterByStatus(event: any) {
    const filterValue = event.value;

    if (!filterValue) {
      this.dataSource.data = this.taskData;
    } else {
      this.dataSource.data = this.taskData.filter((task: any) => task.status == filterValue);
    }
  }

  // Clear Status Filter
  public clearStatusFilter() {
    this.selectedStatus = '';
    this.dataSource.data = this.taskData;
  }



  // get all task details 
  public getTaskList() {
    this.service.getTaskDetailsList().subscribe(
      {
        next: (res: any) => {
          this.taskData = res;
          // console.log("this.taskData", this.taskData);

          this.dataSource = new MatTableDataSource(res);
          this.dataSource.paginator = this.paginatorUser;
          this.dataSource.sort = this.sort;

        },
        error: (error: any) => {

        }
      })
  }

  // for add task
  public onAddTask() {
    this.addTaskForm.reset();
    this.dialogRef = this.dialog.open(this.addTaskDialog, {
      width: '400px',
      disableClose: true
    });
  }

  apiUrl = 'http://localhost:8080/data';
  public onSaveTask() {
    console.log('New Task:', this.addTaskForm.value);

    if (this.addTaskForm.valid) {
      this.taskDetailsModelObj.title = this.addTaskForm.value.title || "";
      this.taskDetailsModelObj.description = this.addTaskForm.value.description || "";
      this.taskDetailsModelObj.priority = this.addTaskForm.value.priority || "";
      this.taskDetailsModelObj.status = this.addTaskForm.value.status || "";

      console.log('this.taskDetailsModelObj', this.taskDetailsModelObj);

      // Fetch the existing tasks to calculate the max ID
      this.http.get<any[]>(this.apiUrl).subscribe({
        next: (tasks: any[]) => {
          const maxId = tasks.length > 0 ? Math.max(...tasks.map(task => task.id)) : 0;
          const taskWithId = { ...this.taskDetailsModelObj, id: maxId + 1 };

          this.service.addTaskDetails(taskWithId).subscribe({
            next: (res: any) => {
              console.log("add->res", res);

              this.snackBar.open('Task saved successfully!', '', {
                panelClass: ['snackbar-success'],
                duration: 3000,
                verticalPosition: 'top',
                horizontalPosition: 'right',
              });

              this.getTaskList();
              this.closeAddDialog();
            },
            error: (error: any) => {
              console.error('Error saving task:', error);
              this.snackBar.open('Error!', '', {
                panelClass: ['snackbar-error'],
                duration: 3000,
                verticalPosition: 'top',
                horizontalPosition: 'right'
              });
            },
          });
        },
        error: (error: any) => {
          console.error('Error fetching tasks:', error);
          this.snackBar.open('Error!', '', {
            panelClass: ['snackbar-error'],
            duration: 3000,
            verticalPosition: 'top',
            horizontalPosition: 'right'
          });
        },
      });
    } else {
      console.warn('Form is invalid');
      this.snackBar.open('Please fill out the form correctly!', '', {
        panelClass: ['snackbar-warning'],
        duration: 3000,
        verticalPosition: 'top',
        horizontalPosition: 'right',

      });
    }
  }

  // Close the dialog
  public closeAddDialog() {
    if (this.dialogRef) {
      this.addTaskForm.reset();
      this.getTaskList();
      this.dialogRef.close();
    }
  }

  // for edit task
  public onEditTask(data: any) {
    console.log('on edit =>', data);
    this.editId = data.id;

    this.updateTaskForm.patchValue({
      title: data.title,
      description: data.description,
      priority: data.priority,
      status: data.status
    })

    this.dialogRef = this.dialog.open(this.updateTaskDialog, {
      width: '400px',
      disableClose: true
    });
  }

  public onUpdateTask() {

    if (this.updateTaskForm.valid) {
      this.taskDetailsModelObj.id = this.editId;
      this.taskDetailsModelObj.title = this.updateTaskForm.value.title || "";
      this.taskDetailsModelObj.description = this.updateTaskForm.value.description || "";
      this.taskDetailsModelObj.priority = this.updateTaskForm.value.priority || "";
      this.taskDetailsModelObj.status = this.updateTaskForm.value.status || "";

      console.log('this.taskDetailsModelObj', this.taskDetailsModelObj);

      this.service.updateTaskDetails(this.editId, this.taskDetailsModelObj).subscribe
        ({
          next: (res: any) => {
            console.log("update->res", res);


            this.snackBar.open('Task updated successfully!', '', {
              panelClass: ['snackbar-success'],
              duration: 3000,
              verticalPosition: 'top',
              horizontalPosition: 'right',
            });


            this.getTaskList();
            this.closeUpdateDialog();
          },
          error: (error: any) => {
            this.snackBar.open('Error!', '', {
              panelClass: ['snackbar-error'],
              duration: 3000,
              verticalPosition: 'top',
              horizontalPosition: 'right'
            });

          }
        })

    }

  }

  public closeUpdateDialog() {
    if (this.dialogRef) {
      this.updateTaskForm.reset();
      this.getTaskList();
      this.dialogRef.close();
    }
  }

  // for delete task
  public deleteTask(data: any) {
    // console.log('on delete=>', data.title);
    this.deleteId = data.id;
    this.taskTitle = data.title
    console.log('on delete  this.deleteId=>', this.deleteId);
    this.dialogRef = this.dialog.open(this.deleteTaskDialog, {
      width: '400px',
      disableClose: true
    });
  }

  public onDeleteTask() {
    this.service.deleteTaskDetails(this.deleteId).subscribe({
      next: (res: any) => {
        this.snackBar.open('Task deleted successfully!', '', {
          panelClass: ['snackbar-success'],
          duration: 3000,
          verticalPosition: 'top',
          horizontalPosition: 'right',
        });
        this.getTaskList();
        this.closeDeleteDialog();

      },
      error: (error: any) => {
        this.snackBar.open('Error!', '', {
          panelClass: ['snackbar-error'],
          duration: 3000,
          verticalPosition: 'top',
          horizontalPosition: 'right'
        });
      }
    })
  }

  public closeDeleteDialog() {
    if (this.dialogRef) {
      this.getTaskList();
      this.dialogRef.close();
    }
  }







}
