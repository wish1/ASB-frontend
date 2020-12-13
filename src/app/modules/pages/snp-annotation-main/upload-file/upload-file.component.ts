import {ChangeDetectionStrategy, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {UploadService} from 'src/app/services/upload.service';
import {BehaviorSubject, Subscription} from 'rxjs';
import {FormBuilder, FormControl} from '@angular/forms';
import * as fromActions from 'src/app/store/action/ananastra';
import {AnnotationStoreState} from 'src/app/store/reducer/ananastra';
import {Router} from '@angular/router';
import {Store} from '@ngrx/store';
import {demo1, demo2} from "../../../../helpers/constants/demo.ananas";
import {getTextByStepNameAnanas} from "../../../../helpers/text-helpers/tour.ananas.helper";
import {ToastrService} from "ngx-toastr";

@Component({
  selector: 'astra-upload-file-component',
  templateUrl: './upload-file.component.html',
  styleUrls: ['./upload-file.component.less'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UploadFileComponent implements OnInit, OnDestroy {
  @ViewChild('fileDropRef')
  private fileDropRef: HTMLInputElement;
  public fileProgress$: BehaviorSubject<number> = new BehaviorSubject<number>(null);
  private subscriptions = new Subscription();
  private ticket: string;
  public textAreaControl: FormControl;
  public file = null;
  constructor(private uploadService: UploadService,
              private store: Store<AnnotationStoreState>,
              private router: Router,
              private toastr: ToastrService,
              private formBuilder: FormBuilder) { }

  ngOnInit(): void {
    this.textAreaControl = this.formBuilder.control('');
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }


  fileDropped($event: FileList): void {
    this.prepareFileList($event);
  }

  fileBrowseHandler(files: FileList): void {
    this.prepareFileList(files);
  }


  deleteFile(): void {
    if (this.file) {
      this.file = null;
      if (this.ticket) {
        this.uploadService.deleteFile(this.ticket).subscribe(
          () => null,
          error => console.error(error)
        );
        this.ticket = null;
      }
      this.reinstallSubscription();
    }
  }
  reinstallSubscription() {
      this.subscriptions.unsubscribe();
      this.subscriptions = new Subscription();
  }
  uploadFile(file: File, forceRedirect?: boolean): void {
    this.fileProgress$.next(0);
    this.subscriptions.add(
      this.uploadService.getFileTicket().subscribe(
        s => {
            if (s  && this.ticket !== s) {
                this.ticket = s;
                if (forceRedirect && this.ticket) {
                    this.annotationStart();
                }
            }
        }
      )
    );
    const formData = new FormData();
    formData.append('file', file);
    this.subscriptions.add(
      this.uploadService.uploadFile(file, formData).subscribe(
        percent => this.fileProgress$.next(percent)
      )
    );
  }
  prepareFileList(files: FileList): void {
    if (files.length > 0) {
      this.deleteFile();
      this.file = Object.defineProperty(files[0], 'progress', {value: 0});
    }
    this.uploadFile(this.file);
  }

  /**
   * format bytes
   * @param bytes (File size in bytes)
   * @param decimals (Decimals point)
   */
  formatBytes(bytes: number, decimals: number = 2): string {
    if (bytes === 0) {
      return '0 Bytes';
    }
    const k = 1024;
    const dm = decimals <= 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  annotationStart(): void {
    this.router.navigateByUrl(`/ticket/${this.ticket}`).then(
      () => {
          this.store.dispatch(new fromActions.annotation.InitAnnotationStartAction(this.ticket));
          this.uploadService.removeFileTicket()
      }
    );
  }

  submit(): void {
    this.reinstallSubscription()
    if (this.ticket && this.file) {
        if (this.file.progress == 100) {
            this.annotationStart();
        } else {
            this.toastr.warning('Your file is still loading', 'Warning')
        }
    } else {
      if (!!this.textAreaControl.value) {
        const file = new File([this.textAreaControl.value], 'my-list.txt');
        this.uploadFile(file, true);
      }
    }

  }

    initDemo(id: number) {
      const patchValue: string = id === 1 ? demo1 : demo2;
      this.textAreaControl.patchValue(patchValue);
    }

    getTextByStepName(str: string) {
        return getTextByStepNameAnanas(str);
    }
}
