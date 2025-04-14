import 'reflect-metadata';
import { plainToClass, Type } from 'class-transformer';
import { publicDecrypt } from 'crypto';

/**
 * FolderMappingData
 * @description Represents the mapping data for a folder
 */
export class FolderMappingData {

  @Type(() => JoplinFolder)
  joplinFolders: JoplinFolder[];

  @Type(() => SystemFolder)
  systemFolders: SystemFolder[];

  public compares: any[];

  constructor(
    public systemRootPath: string,
    joplinFolders: JoplinFolder[],
    systemFolders: SystemFolder[]
  ){
    this.joplinFolders = joplinFolders;
    this.systemFolders = systemFolders;
  }

}

/**
 * JoplinFolder
 * @description Represents a folder in Joplin
 */
export class JoplinFolder {

  constructor(
    public id: string,
    public title: string,
    public parentId: string,
    public path: string,
    public systemFolderExists: boolean
  ){}
}

/**
 * SystemFolder
 * @description Represents a folder in the system
 */
export class SystemFolder {
  constructor(
    public id: string,
    public path: string
  ){}
}

/**
 * SystemFile
 * @description Represents a file in the system
 */
export class SystemFile {
  public id: string;
  public type: string;
  public size: number;
  public isHidden: boolean;
  constructor(
    public name: string,
    public path: string,
    public isDirectory: boolean
  ){}
}

export const jsonToFolderMappingData = function (orderJSON: string): FolderMappingData {
  return plainToClass(FolderMappingData, JSON.parse(orderJSON));
}