import { AxiosResponse } from 'axios';

export class TwitterUser {
  public constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly username: string
  ) { }
}

export type GetTwitterUserResponse =
  { kind: 'Success', user: TwitterUser } |
  { kind: 'Invalid response', response: AxiosResponse<any, any> } |
  { kind: 'Network error', error: any };
