import { User } from "../User";
import { Endpoint, NetworkError, isString } from "./Endpoint";

export type GetUserResponse =
  | { kind: "Success"; user: User }
  | { kind: "Response with errors"; errors: any[] }
  | { kind: "Invalid response"; response: any }
  | { kind: "Network error"; error: NetworkError };

/// https://developer.twitter.com/en/docs/twitter-api/users/lookup/api-reference/get-users-by-username-username
export class GetUserEndpoint extends Endpoint {
  public async call(username: string): Promise<GetUserResponse> {
    const url = `https://api.twitter.com/2/users/by/username/${username}`;
    const result = await this.get(url);

    switch (result.kind) {
      case "Success":
        const response = result.response as ResponseModel;

        if (response.errors) {
          return { kind: "Response with errors", errors: response.errors };
        }

        const id = response.data?.id;
        const name = response.data?.name;
        const username = response.data?.username;

        const isValid = isString(id) && isString(name) && isString(username);
        if (!isValid) {
          return { kind: "Invalid response", response: response.data };
        }

        const user = new User(id, name, username);
        return { kind: "Success", user };

      case "Network error":
        return { kind: "Network error", error: result.error };
    }
  }
}

interface ResponseModel {
  data: {
    readonly id: string;
    readonly name: string;
    readonly username: string;
  };
  errors?: {
    readonly title: string;
    readonly detail: string;
    readonly type: string;
  }[];
}
