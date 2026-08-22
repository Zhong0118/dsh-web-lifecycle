declare module '@deepseek-ai/cordis' {
  export interface Context {
    inject(deps: string[], callback: (ctx: this) => void): void
    get(name: string): unknown
    effect(setup: () => void | (() => void), name?: string): void
    webServer: {
      readonly port: number
      readonly host: string
      register(route: {
        kind: 'exact' | 'prefix'
        path: string
        handler: (req: import('node:http').IncomingMessage, res: import('node:http').ServerResponse) => void | Promise<void>
      }): () => void
    }
    cmdlineArgs?: { get(): readonly string[] }
    appExit?: (code: number) => void
  }
}

declare module '@deepseek-ai/dsh-client-runtime/client' {
  export interface ClientContext {
    effect(setup: () => void | (() => void), name?: string): void
    locale: {
      register(ns: string, dictionaries: Record<string, Record<string, string>>): () => void
      bind(ns: string): (key: string) => string
    }
    slots: {
      inject(name: string, factory: () => unknown): void
      register(
        options: {
          name: string
          id?: string
          order?: number
          label?: () => string
          locale?: string
        },
        component: unknown,
      ): unknown
    }
  }
}

declare module '@deepseek-ai/dsh-client-locale/client' {}
declare module '@deepseek-ai/dsh-client-ui-settings/client' {}
